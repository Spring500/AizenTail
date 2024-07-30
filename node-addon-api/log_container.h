#ifndef MYOBJECT_H
#define MYOBJECT_H

#include <string>

const int MAX_LOGS = 500000;

class LogContainer {
 public:
    LogContainer();
    ~LogContainer();
    
    const std::string *logs = new std::string[MAX_LOGS];

    std::string GetLogByIndex(int index);
    void SetLogByIndex(int index, std::string log);

 private:
  Napi::Value GetValue(const Napi::CallbackInfo& info);
  Napi::Value PlusOne(const Napi::CallbackInfo& info);
  Napi::Value Multiply(const Napi::CallbackInfo& info);

  double value_;
};

#endif