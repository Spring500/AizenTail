#include "log_container.h"
#include "utils/macros.h"
#include <sstream>
#include <regex>

Napi::Object LogContainer::Init(Napi::Env env, Napi::Object exports)
{
    auto func = DefineClass(env, "LogContainer", {
        ADD_INSTANCE_METHOD(LogContainer, length),
        ADD_INSTANCE_METHOD(LogContainer, push),
        ADD_INSTANCE_METHOD(LogContainer, pushMulti),
        ADD_INSTANCE_METHOD(LogContainer, clear),
        ADD_INSTANCE_METHOD(LogContainer, get),
        ADD_INSTANCE_METHOD(LogContainer, debugStr),
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

    logs = new RingBuffer<LogData>(size);
    filtedLines = new RingBuffer<int>(size);
}

LogContainer::~LogContainer() {
    delete logs;
    delete filtedLines;
}

Napi::Value LogContainer::length_Wrapper(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::Number::New(env, length());
}

void LogContainer::PopLog()
{
    if(length() <= 0) return;
    // 如果删除的是筛选后的第一行，则删除筛选后列表中的对应行（必定也是第一行）
    if(filtedLines->get(0) == logs->indexToReal(0))
        filtedLines->pop();
    logs->pop();
}

void LogContainer::PushLog(std::string log)
{
    if(logs->full()) PopLog();
    logs->push({log});
    
    if(CheckLog(log)){
        const auto index = logs->length() - 1;
        filtedLines->push(logs->indexToReal(index));
    }
}

void LogContainer::push_Wrapper(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if(info.Length() <= 0 || !info[0].IsString()) {
        THROW_EXCEPTION(env, "String expected in the first argument");
        return;
    }
    PushLog(info[0].As<Napi::String>().Utf8Value());
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
        PushLog(texts.substr(startP, i - startP));
        startP = i + 1;
    }
    if(startP < texts.length()) {
        PushLog(texts.substr(startP, texts.length() - startP));
    }
}

void LogContainer::ClearLogs()
{
    logs->clear();
    filtedLines->clear();
}

void LogContainer::clear_Wrapper(const Napi::CallbackInfo &info)
{
    ClearLogs();
}

void LogContainer::RefreshFilter()
{
    filtedLines->clear();
    for(int i = 0; i < length(); i++) {
        const auto &log = (*logs)[i];
        if(CheckLog(log.log)) {
            const auto realIndex = logs->indexToReal(i);
            filtedLines->push(realIndex);
        }
    }
}

int LogContainer::GetIndex(const int line)
{
    if(line < 0 || line >= filtedLines->length())
        return -1;
    return (*filtedLines)[line];
}

Napi::Value LogContainer::get_Wrapper(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if(info.Length() <= 0 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Number expected").ThrowAsJavaScriptException();
        return env.Null();
    }
    auto line = info[0].As<Napi::Number>().Int32Value();
    auto index = GetIndex(line);
    if(index == -1) {
        Napi::TypeError::New(env, "Line #" + std::to_string(line) + " not found").ThrowAsJavaScriptException();
        return env.Undefined();
    }


    return Napi::String::New(env, (*logs)[index].log);
}

Napi::Value LogContainer::debugStr_Wrapper(const Napi::CallbackInfo &info)
{
    std::stringstream result;
    result << "日志总数:" << logs->length() << "\n\n日志内容:\n";

    for(int i = 0; i < logs->length(); i++) {
        const auto &log = logs->get(i);
        const auto realIndex = logs->indexToReal(i);
        result << "第" << i << "行(logs内部序列号" << realIndex << "):" << log.log << "\n";
    }
    result << "\n筛选后的日志总数:" << filtedLines->length() << "\n\n筛选后的日志内容:\n";
    for(int i = 0; i < filtedLines->length(); i++) {
        const auto index = logs->realToIndex(filtedLines->get(i));
        const auto realIndex = filtedLines->indexToReal(i);
        const auto &logText = index == -1 ? "[未找到]" : logs->get(index).log;
        result << "第" << i << "行(原第" << index << "行，filtedLines内部序列号" << realIndex << ")" << logText << "\n";
    }
    return Napi::String::New(info.Env(), result.str());
}

bool LogContainer::CheckLog(const std::string &index)
{
    // TODO: 检查日志是否在筛选后的日志中。正则匹配+缓存结果
    return true;
}
