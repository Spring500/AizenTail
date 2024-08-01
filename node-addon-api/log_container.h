#ifndef LOG_CONTAINER_H
#define LOG_CONTAINER_H

#include <string>
#include <regex>
#include <napi.h>
#include "utils/ring_buffer.h"

const int DEFAULT_MAX_LOGS = 255;

struct LogData
{
public:
   std::string log;
};

class LogContainer : public Napi::ObjectWrap<LogContainer> {
public:
   static Napi::Object Init(Napi::Env env, Napi::Object exports);
   LogContainer(const Napi::CallbackInfo& info);
   ~LogContainer();
   // 返回日志容器中（不论是否筛选的）的日志数量
   int length() { return logs->length(); }
   Napi::Value length_Wrapper(const Napi::CallbackInfo& info);

   // 删除日志中的第一条日志
   void PopLog();

   // 在日志容器中添加日志
   void PushLog(std::string log);
   // 在日志容器中添加日志(javascript调用)
   void push_Wrapper(const Napi::CallbackInfo& info);
   // 在日志容器中添加多行日志(javascript调用)
   void pushMulti_Wrapper(const Napi::CallbackInfo& info);
   
   // 清空日志容器
   void ClearLogs();
   // 清空日志容器(javascript调用)
   void clear_Wrapper(const Napi::CallbackInfo& info);
   // 刷新所有日志的筛选状态
   void RefreshFilter();

   // 根据行数获得日志对应的index
   int GetIndex(const int line);
   // 获取日志容器中的日志
   Napi::Value get_Wrapper(const Napi::CallbackInfo& info);
   // 打印调试信息
   Napi::Value debugStr_Wrapper(const Napi::CallbackInfo &info);

   // 检查日志是否在筛选后的日志中
   bool CheckLog(const std::string &index);
private:
   // 筛选后的日志列表，filtedLines[i]=j表示筛选后的日志中的第i行对应logs内部真实id为j的日志
   RingBuffer<int> *filtedLines;
   // 未经筛选的日志列表
   RingBuffer<LogData> *logs;

   double value_;
};

#endif