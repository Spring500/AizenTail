// compile with: /W1
#include "log_container.h"
#include "utils/macros.h"
#include <sstream>
#include <exception>
#include <regex>
#include <napi.h>
Napi::Object LogContainer::Init(Napi::Env env, Napi::Object exports)
{
    auto func = DefineClass(env, "LogContainer", {
        ADD_INSTANCE_METHOD(LogContainer, length),
        ADD_INSTANCE_METHOD(LogContainer, filtedLength),
        ADD_INSTANCE_METHOD(LogContainer, push),
        ADD_INSTANCE_METHOD(LogContainer, pushMulti),
        ADD_INSTANCE_METHOD(LogContainer, clear),
        ADD_INSTANCE_METHOD(LogContainer, get),
        ADD_INSTANCE_METHOD(LogContainer, debugStr),
        ADD_INSTANCE_METHOD(LogContainer, setRules),
    });

    auto constructor = new Napi::FunctionReference();
    *constructor = Napi::Persistent(func);

    env.SetInstanceData(constructor);
    exports.Set("LogContainer", func);
    return exports;
}

LogContainer::LogContainer(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<LogContainer>(info)
{
    Napi::Env env = info.Env();
    int length = info.Length();
    int size = 0;
    if (length <= 0 || !info[0].IsNumber()) 
        size = DEFAULT_MAX_LOGS;
    else
        size = info[0].As<Napi::Number>().Int32Value();

    logs.resize(size);
    filtedLines.resize(size);
}

Napi::Value LogContainer::length_Wrapper(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::Number::New(env, size());
}

Napi::Value LogContainer::filtedLength_Wrapper(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::Number::New(env, filtedLines.size());
}

void LogContainer::pop_log()
{
    if(size() <= 0) return;
    // 如果删除的是满足筛选条件的日志(必定是筛选后日志的第一行)，则删除筛选后列表中的对应行
    if(filtedLines.get(0) == logs.indexToReal(0))
        filtedLines.pop();
    logs.pop();
}

void LogContainer::push_log(std::string log)
{
    if(logs.full()) pop_log();
    logs.push({log});
    
    const auto index = logs.size() - 1;
    if(check_log(logs.get(index)))
        filtedLines.push(logs.indexToReal(index));
}

void LogContainer::push_Wrapper(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if(info.Length() <= 0 || !info[0].IsString()) {
        THROW_EXCEPTION(env, "String expected in the first argument");
        return;
    }
    push_log(info[0].As<Napi::String>().Utf8Value());
}

void LogContainer::pushMulti_Wrapper(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if(info.Length() <= 0 || !info[0].IsString()) {
        THROW_EXCEPTION(env, "String expected in the first argument");
        return;
    }
    auto texts = info[0].As<Napi::String>().Utf8Value();
        auto startP = 0;
    for(int i = 0; i < texts.length(); i++) {
        auto c = texts[i];
        if(texts[i] != '\n') continue;
        push_log(texts.substr(startP, i - startP));
        startP = i + 1;
    }
    if(startP < texts.length()) {
        push_log(texts.substr(startP, texts.length() - startP));
    }
}


void LogContainer::clear_rules()
{
    for(auto &rule : rules)
        patterns.erase_by_index(rule.patternIndex);
    rules.clear();
}

void LogContainer::setRules_Wrapper(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if(info.Length() <= 0 || !info[0].IsArray()) {
        THROW_EXCEPTION(env, "Array expected in the first argument");
        return;
    }
    auto rulesRaw = info[0].As<Napi::Array>();
    int length = rulesRaw.Length();
    try{
        clear_rules();
        
        for(int i = 0; i < length; i++) {
            auto rule = rulesRaw.Get(i).As<Napi::Object>();
            auto enableRaw = rule.Get("enable");
            if(!enableRaw.IsBoolean()){
                THROW_EXCEPTION(env, "enable should be a boolean value");
                return;
            }
            auto enable = enableRaw.As<Napi::Boolean>().Value();
            if(!enable) continue;

            auto patternRaw = rule.Get("reg");
            if(!patternRaw.IsString()){
                THROW_EXCEPTION(env, "reg should be an string");
                return;
            }
            auto text = patternRaw.As<Napi::String>().Utf8Value();
            auto isRegexRaw = rule.Get("regexEnable");
            if(!isRegexRaw.IsBoolean()){
                THROW_EXCEPTION(env, "regexEnable should be a boolean value");
                return;
            }
            auto isRegex = isRegexRaw.As<Napi::Boolean>().Value();
            auto ignoreCaseRaw = rule.Get("ignoreCase");
            if(!ignoreCaseRaw.IsBoolean()){
                THROW_EXCEPTION(env, "ignoreCase should be a boolean value");
                return;
            }
            auto ignoreCase = ignoreCaseRaw.As<Napi::Boolean>().Value();
            auto isExcludeRaw = rule.Get("exclude");
            if(!isExcludeRaw.IsBoolean()){
                THROW_EXCEPTION(env, "exclude should be a boolean value");
                return;
            }
            auto isExclude = isExcludeRaw.As<Napi::Boolean>().Value();
            auto patternIndex = patterns.push({text, isRegex, ignoreCase});
            if(patternIndex != -1) rules.push_back({patternIndex, isExclude});
        }
        refresh_rules();
    } 
    catch(std::exception &e){
        std::string message = "运行时错误:";
        message += e.what();
        THROW_EXCEPTION(env, message);
    }
    catch(...){
        THROW_EXCEPTION(env, "unknown error");
    }
}

void LogContainer::clear()
{
    logs.clear();
    filtedLines.clear();
}

void LogContainer::clear_Wrapper(const Napi::CallbackInfo &info)
{
    clear();
}

void LogContainer::refresh_rules()
{
    try{
        filtedLines.clear();
        if(rules.size() == 0){
            for(int i = 0; i < logs.size(); i++)
                filtedLines.push(logs.indexToReal(i));
            return;
        }
        for(int i = 0; i < logs.size(); i++) {
            for(const auto &rule : rules){
                auto pattern_index = rule.patternIndex;
                auto pattern = patterns.get_value(rule.patternIndex);
                if(check_one_rule(pattern, pattern_index, logs.get(i))) {
                    const auto realIndex = logs.indexToReal(i);
                    filtedLines.push(realIndex);
                }
            }
        }
    }
    catch(std::exception &e){
        throw std::runtime_error("刷新规则时错误:" + std::string(e.what()));
    }
}

int LogContainer::get_index(const int line)
{
    if(line < 0 || line >= filtedLines.size())
        return -1;
    const auto realIndex = filtedLines.get(line);
    return logs.realToIndex(realIndex);
}

Napi::Value LogContainer::get_Wrapper(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if(info.Length() <= 0 || !info[0].IsNumber()) {
        THROW_EXCEPTION(env, "Number expected");
        return env.Null();
    }
    auto line = info[0].As<Napi::Number>().Int32Value();
    auto index = get_index(line);
    if(index == -1) {
        THROW_EXCEPTION(env, "Line #" + std::to_string(line) + " not found");
        return env.Undefined();
    }


    return Napi::String::New(env, logs.get(index).log);
}

Napi::Value LogContainer::debugStr_Wrapper(const Napi::CallbackInfo &info)
{
    std::stringstream result;
    result << "日志总数:" << logs.size()  
        << " 筛选后的日志总数:" << filtedLines.size() << " 日志内容:\n";
    std::set<int> filtedLinesSet;
    for(int i = 0; i < filtedLines.size(); i++) {
        filtedLinesSet.insert(filtedLines.get(i));
    }
    for(int i = 0; i < logs.size(); i++) {
        const auto &log = logs.get(i);
        const auto realIndex = logs.indexToReal(i);
        bool isFiltered = filtedLinesSet.find(realIndex) != filtedLinesSet.end();
        result << "    #" << i << "("<< "logs内部序列号" << realIndex << "): " 
            << (isFiltered?"\033[32m": "\033[35m") << log.log << "\033[0m\n";
    }
    if(rules.size() == 0) {
        result << "\n筛选规则: 无\n";
    } else {
        result << "\n筛选规则:\n";
        for(int i = 0; i < rules.size(); i++) {
            const auto &rule = rules[i];
            const auto &pattern = patterns.get_value(rule.patternIndex);
            result << "    #" << i << ": "
                << "\033[32m" << pattern.text << "\033[0m"
                << (rule.isExclude ? " 排除" : " 包含") 
                << (pattern.ignoreCase ? " 忽略大小写" : "")  
                << (pattern.isRegex ? " 正则" : "") << "\n";
        }
    }
    return Napi::String::New(info.Env(), result.str());
}

bool LogContainer::check_one_rule(const MatchPattern &pattern, const int pattern_index, LogData &data)
{
    if (data.results.size() <= pattern_index)
        data.results.push_back(UNKNOWN);
    
    if(data.results[pattern_index] != UNKNOWN){
        return data.results[pattern_index] == MATCHED;
    }
    bool result = false;
    if(pattern.isRegex) {
        std::regex::flag_type flag = std::regex::ECMAScript;
        if(pattern.ignoreCase) flag |= std::regex::icase;
        std::regex reg(pattern.text, flag);
        result = std::regex_search(data.log, reg);
    } else {
        // TODO: 暂未实现非正则匹配的忽略大小写
        if (pattern.ignoreCase) {
            result = data.log.find(pattern.text) != std::string::npos;
        } else {
            result = data.log.find(pattern.text) != std::string::npos;
        }
    }
    data.results[pattern_index] = result ? MATCHED : NOT_MATCHED;
    return result;
}


bool LogContainer::check_log(LogData &data)
{
    if(rules.size() == 0) return true;
    for(const auto &rule : rules) {
        const auto pattern_index = rule.patternIndex;
        const auto pattern = patterns.get_value(pattern_index);
        const auto result = check_one_rule(pattern, pattern_index, data);
        if(rule.isExclude && !result) return false;
        if(!rule.isExclude && result) return true;
    }
    return false;
}
