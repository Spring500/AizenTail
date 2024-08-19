#include "node_log_container.h"
#include "utils/macros.h"
#include <sstream>
#include <napi.h>

Napi::Object NodeLogContainer::Init(Napi::Env env, Napi::Object exports)
{
    auto func = DefineClass(env, "LogContainer", {
        ADD_INSTANCE_METHOD(NodeLogContainer, length),
        ADD_INSTANCE_METHOD(NodeLogContainer, filtedLength),
        ADD_INSTANCE_METHOD(NodeLogContainer, push),
        ADD_INSTANCE_METHOD(NodeLogContainer, pushMulti),
        ADD_INSTANCE_METHOD(NodeLogContainer, clear),
        ADD_INSTANCE_METHOD(NodeLogContainer, getUnfilted),
        ADD_INSTANCE_METHOD(NodeLogContainer, getFilted),
        ADD_INSTANCE_METHOD(NodeLogContainer, isFilted),
        
        ADD_INSTANCE_METHOD(NodeLogContainer, debugStr),
        ADD_INSTANCE_METHOD(NodeLogContainer, setRules),
    });

    auto constructor = new Napi::FunctionReference();
    *constructor = Napi::Persistent(func);

    env.SetInstanceData(constructor);
    exports.Set("LogContainer", func);
    return exports;
}

NodeLogContainer::NodeLogContainer(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<NodeLogContainer>(info), LogContainer(0)
{
    Napi::Env env = info.Env();
    int length = info.Length();
    int init_size = 0;
    if (length <= 0 || !info[0].IsNumber()) 
        init_size = DEFAULT_MAX_LOGS;
    else
        init_size = info[0].As<Napi::Number>().Int32Value();
    logs.resize(init_size);
    filtedLines.resize(init_size);
}

Napi::Value NodeLogContainer::length_Wrapper(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::Number::New(env, size());
}

Napi::Value NodeLogContainer::filtedLength_Wrapper(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::Number::New(env, filtedLines.size());
}

void NodeLogContainer::push_Wrapper(const Napi::CallbackInfo &info)
{
    CHECK_FUNCTION(info, 1, );
    GET_STR_PARAM(info, env, 0, text, );

    push_log(text);
}

void NodeLogContainer::pushMulti_Wrapper(const Napi::CallbackInfo &info)
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

void NodeLogContainer::setRules_Wrapper(const Napi::CallbackInfo &info)
{
    CHECK_FUNCTION(info, 1, );
    GET_ARRAY_PARAM(info, env, 0, rulesRaw, );

    int length = rulesRaw.Length();
    try{
        clear_rules();
        
        for(int i = 0; i < length; i++) {
            auto rule = rulesRaw.Get(i).As<Napi::Object>();
            CAST_TO_BOOL(rule.Get("enable"), enable,);

            if(!enable) continue;

            CAST_TO_STRING(rule.Get("reg"), text,);
            CAST_TO_BOOL(rule.Get("regexEnable"), regexEnable,);
            CAST_TO_BOOL(rule.Get("ignoreCase"), ignoreCase,);
            CAST_TO_BOOL(rule.Get("exclude"), exclude,);

            auto patternIndex = patterns.push({text, regexEnable, ignoreCase});
            if(patternIndex != -1) rules.push_back({patternIndex, exclude});
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

void NodeLogContainer::clear_Wrapper(const Napi::CallbackInfo &info)
{
    clear();
}

Napi::Value NodeLogContainer::getUnfilted_Wrapper(const Napi::CallbackInfo &info)
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

Napi::Value NodeLogContainer::getFilted_Wrapper(const Napi::CallbackInfo &info)
{
    CHECK_FUNCTION(info, 1, env.Null());
    GET_INT_PARAM(info, env, 0, line, env.Null());

    auto index = get_index(line);
    ASSERT_AND_THROW(
        index != -1, 
        "Line #" + std::to_string(line) + " not found",
        env.Null()
    );
    return Napi::String::New(env, logs.get(index).text);
}

Napi::Value NodeLogContainer::isFilted_Wrapper(const Napi::CallbackInfo &info)
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

Napi::Value NodeLogContainer::debugStr_Wrapper(const Napi::CallbackInfo &info)
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
            << (isFiltered?"\033[33m\033[4m": "\033[2m") << log.text << "\033[0m\n";
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