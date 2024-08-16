#ifndef NODE_LOG_CONTAINER_H
#define NODE_LOG_CONTAINER_H

#include <napi.h>
#include "log_container.h"

class NodeLogContainer : public Napi::ObjectWrap<NodeLogContainer>, public LogContainer {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    NodeLogContainer(const Napi::CallbackInfo& info);
    ~NodeLogContainer() {}
protected:

    // 返回日志容器中（不论是否筛选的）的日志数量(javascript调用)
    Napi::Value length_Wrapper(const Napi::CallbackInfo& info);
    // 返回日志容器中筛选后的日志数量(javascript调用)
    Napi::Value filtedLength_Wrapper(const Napi::CallbackInfo& info);

    // 在日志容器中添加日志(javascript调用)
    void push_Wrapper(const Napi::CallbackInfo& info);
    // 在日志容器中添加多行日志(javascript调用)
    void pushMulti_Wrapper(const Napi::CallbackInfo& info);
        // 重设日志容器筛选规则(javascript调用)
    void setRules_Wrapper(const Napi::CallbackInfo& info);

        // 清空日志容器(javascript调用)
    void clear_Wrapper(const Napi::CallbackInfo& info);

        // 根据筛选前行数获取日志容器中指定行的日志(javascript调用)
    Napi::Value getUnfilted_Wrapper(const Napi::CallbackInfo& info);
    // 根据筛选后行数获取日志容器中指定行的日志(javascript调用)
    Napi::Value getFilted_Wrapper(const Napi::CallbackInfo& info);
    // 根据筛选前行数获取日志容器中指定行的日志是否被筛选(javascript调用)
    Napi::Value isFilted_Wrapper(const Napi::CallbackInfo& info);
    // 打印调试信息
Napi::Value debugStr_Wrapper(const Napi::CallbackInfo &info);
};

#endif