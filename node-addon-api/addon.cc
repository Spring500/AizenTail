#include <string>
#include <napi.h>

Napi::String Method(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  return Napi::String::New(env, "world");
}

const int MAX_LOGS = 500000;
auto logs = new std::string[500000];
Napi::Value GetLogByIndex(const Napi::CallbackInfo& info) {
  auto env = info.Env();
  auto index = int(info[0].As<Napi::Number>().Int32Value());
  if(index < 0 || index >= MAX_LOGS) {
    Napi::TypeError::New(env, "Invalid index").ThrowAsJavaScriptException();
    return env.Null();
  }
  return Napi::String::New(env, logs[index]);
}

void SetLogByIndex(const Napi::CallbackInfo& info) {
  auto env = info.Env();
  auto index = int(info[0].As<Napi::Number>().Int32Value());
  Napi::String log = info[1].As<Napi::String>();
  if(index < 0 || index >= MAX_LOGS) {
    Napi::TypeError::New(env, "Invalid index").ThrowAsJavaScriptException();
    return;
  }
  logs[index] = log.Utf8Value();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "hello"),
              Napi::Function::New(env, Method));
  exports.Set(Napi::String::New(env, "getLogByIndex"),
              Napi::Function::New(env, GetLogByIndex));
  exports.Set(Napi::String::New(env, "setLogByIndex"),
              Napi::Function::New(env, SetLogByIndex));
  return exports;
}

NODE_API_MODULE(hello, Init)
