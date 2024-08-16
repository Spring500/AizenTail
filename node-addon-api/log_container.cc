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
        ADD_INSTANCE_METHOD(LogContainer, getUnfilted),
        ADD_INSTANCE_METHOD(LogContainer, getFilted),
        ADD_INSTANCE_METHOD(LogContainer, isFilted),
        
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
    CHECK_FUNCTION(info, 1, );
    GET_STR_PARAM(info, env, 0, text, );

    push_log(text);
}

void LogContainer::pushMulti_Wrapper(const Napi::CallbackInfo &info)
{
    CHECK_FUNCTION(info, 1, );
    GET_STR_PARAM(info, env, 0, texts, );
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

    for(int i = 0; i < logs.size(); i++) {
        logs.get(i).results.clear();
    }
}

void LogContainer::setRules_Wrapper(const Napi::CallbackInfo &info)
{
    CHECK_FUNCTION(info, 1, );
    GET_ARRAY_PARAM(info, env, 0, rulesRaw, );

    int length = rulesRaw.Length();
    try{
        clear_rules();
        
        for(int i = 0; i < length; i++) {
            auto rule = rulesRaw.Get(i).As<Napi::Object>();
            auto enableRaw = rule.Get("enable");
            ASSERT_AND_THROW(enableRaw.IsBoolean(), "enable should be a boolean value",);
            
            auto enable = enableRaw.As<Napi::Boolean>().Value();
            if(!enable) continue;

            auto patternRaw = rule.Get("reg");
            ASSERT_AND_THROW(patternRaw.IsString(), "reg should be an string",);
            auto text = patternRaw.As<Napi::String>().Utf8Value();

            auto isRegexRaw = rule.Get("regexEnable");
            ASSERT_AND_THROW(isRegexRaw.IsBoolean(), "regexEnable should be a boolean value",);
            auto isRegex = isRegexRaw.As<Napi::Boolean>().Value();

            auto ignoreCaseRaw = rule.Get("ignoreCase");
            ASSERT_AND_THROW(ignoreCaseRaw.IsBoolean(), "ignoreCase should be a boolean value",);
            auto ignoreCase = ignoreCaseRaw.As<Napi::Boolean>().Value();

            auto isExcludeRaw = rule.Get("exclude");
            ASSERT_AND_THROW(isExcludeRaw.IsBoolean(), "exclude should be a boolean value",);
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

std::string LogContainer::get_log(int line)
{
    return logs.get(line).log;
}

std::string LogContainer::get_filted_log(int line)
{
    const auto realIndex = filtedLines.get(line);
    return logs.get(logs.realToIndex(realIndex)).log;
}

bool LogContainer::is_filtered(int line)
{
    const auto realIndex = logs.indexToReal(line);
    return filtedLines.has(realIndex);
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

int LogContainer::get_index(const int line)
{
    if(line < 0 || line >= filtedLines.size())
        return -1;
    const auto realIndex = filtedLines.get(line);
    return logs.realToIndex(realIndex);
}

Napi::Value LogContainer::getUnfilted_Wrapper(const Napi::CallbackInfo &info)
{
    CHECK_FUNCTION(info, 1, env.Null());
    GET_INT_PARAM(info, env, 0, line, env.Null());
    ASSERT_AND_THROW(
        line >= 0 && line < logs.size(), 
        "Line #" + std::to_string(line) + " out of bound",
        env.Null()
    );
    return Napi::String::New(env, get_log(line));
}

Napi::Value LogContainer::getFilted_Wrapper(const Napi::CallbackInfo &info)
{
    CHECK_FUNCTION(info, 1, env.Null());
    GET_INT_PARAM(info, env, 0, line, env.Null());

    auto index = get_index(line);
    ASSERT_AND_THROW(
        index != -1, 
        "Line #" + std::to_string(line) + " not found",
        env.Null()
    );
    return Napi::String::New(env, logs.get(index).log);
}

Napi::Value LogContainer::isFilted_Wrapper(const Napi::CallbackInfo &info)
{
    CHECK_FUNCTION(info, 1, env.Null());
    GET_INT_PARAM(info, env, 0, line, env.Null());

    ASSERT_AND_THROW(
        line >= 0 && line < logs.size(), 
        "Line #" + std::to_string(line) + " out of bound",
        env.Null()
    );
    return Napi::Boolean::New(env, is_filtered(line));
}

Napi::Value LogContainer::debugStr_Wrapper(const Napi::CallbackInfo &info)
{
    std::stringstream result;
    result << "日志总数:\033[33m" << logs.size()  
        << "\033[0m 筛选后的日志总数:\033[33m" << filtedLines.size() << "\033[0m 日志内容:\n";
    std::set<int> filtedLinesSet;
    for(int i = 0; i < filtedLines.size(); i++) {
        filtedLinesSet.insert(filtedLines.get(i));
    }
    for(int i = 0; i < logs.size(); i++) {
        const auto &log = logs.get(i);
        const auto realIndex = logs.indexToReal(i);
        bool isFiltered = filtedLinesSet.find(realIndex) != filtedLinesSet.end();
        result << "    #\033[33m" << i << "\033[0m("<< "realIndex=\033[33m" << realIndex << "\033[0m): " 
            << (isFiltered?"\033[33m\033[4m": "\033[2m") << log.log << "\033[0m\n";
    }
    if(rules.size() == 0) {
        result << "\n筛选规则: 无\n";
    } else {
        result << "\n筛选规则:\n";
        for(int i = 0; i < rules.size(); i++) {
            const auto &rule = rules[i];
            const auto &pattern = patterns.get_value(rule.patternIndex);
            result << "    #\033[33m" << i << "\033[0m(" << "patternIndex=\033[33m" << rule.patternIndex << "\033[0m): "
                << "\033[32m\033[4m" << pattern.text << "\033[0m"
                << (rule.isExclude ? " 排除" : " 包含") 
                << (pattern.ignoreCase ? " 忽略大小写" : "")  
                << (pattern.isRegex ? " 正则" : "") << "\n";
        }
    }
    return Napi::String::New(info.Env(), result.str());
}

bool LogContainer::check_one_rule(const MatchPattern &pattern, const int pattern_index, LogData &data)
{
    auto &results = data.results;
    if (results.size() <= pattern_index)
        results.resize(pattern_index + 1, UNKNOWN);
    
    if(results[pattern_index] != UNKNOWN){
        return results[pattern_index] == MATCHED;
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
    results[pattern_index] = result ? MATCHED : NOT_MATCHED;
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
