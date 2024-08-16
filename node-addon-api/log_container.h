#ifndef LOG_CONTAINER_H
#define LOG_CONTAINER_H

#include <string>
#include <regex>
#include <vector>
#include <set>
#include <napi.h>
#include "utils/ring_buffer.h"
#include "utils/indexed_set.h"

const int DEFAULT_MAX_LOGS = 255;

enum EMatchResult
{
   MATCHED,
   NOT_MATCHED,
   UNKNOWN,
};

struct LogData
{
public:
   std::string log;
   std::vector<EMatchResult> results;
};

struct MatchPattern{
   MatchPattern(): text(""), isRegex(false), ignoreCase(false){};
   MatchPattern(std::string text, bool isRegex, bool ignoreCase)
      : text(text), isRegex(isRegex), ignoreCase(ignoreCase){
         if(isRegex){
            auto flag = std::regex_constants::ECMAScript;
            if(ignoreCase) flag |= std::regex_constants::icase;
            reg = std::regex(text, flag);
         }
      }
   std::string text;
   std::regex reg;
   bool isRegex;
   bool ignoreCase;
   bool operator<(const MatchPattern &rhs) const{
      if(text != rhs.text) return text < rhs.text;
      if(isRegex != rhs.isRegex) return isRegex < rhs.isRegex;
      if(ignoreCase != rhs.ignoreCase) return ignoreCase < rhs.ignoreCase;
   }
   bool operator==(const MatchPattern &rhs) const{
      return !(*this < rhs) && !(rhs < *this);
   }
};

struct MatchRule
{
   int patternIndex;
   bool isExclude;
};

class LogContainer : public Napi::ObjectWrap<LogContainer> {
public:
   static Napi::Object Init(Napi::Env env, Napi::Object exports);
   LogContainer(const Napi::CallbackInfo& info);
   ~LogContainer() {}

   // 返回日志容器中（不论是否筛选的）的日志数量
   int size() { return logs.size(); }
   // 返回日志容器的最大容量
   int max_size() { return logs.max_size(); }
   // 返回日志容器中（不论是否筛选的）的日志数量(javascript调用)
   Napi::Value length_Wrapper(const Napi::CallbackInfo& info);
   // 返回日志容器中筛选后的日志数量(javascript调用)
   Napi::Value filtedLength_Wrapper(const Napi::CallbackInfo& info);

   // 删除日志中的第一条日志
   void pop_log();

   // 在日志容器中添加日志
   void push_log(std::string log);
   // 在日志容器中添加日志(javascript调用)
   void push_Wrapper(const Napi::CallbackInfo& info);
   // 在日志容器中添加多行日志(javascript调用)
   void pushMulti_Wrapper(const Napi::CallbackInfo& info);

   // 在日志容器中添加筛选规则
   void push_rule(std::string pattern, bool isRegex, bool ignoreCase, bool isExclude);
   // 删除日志容器中的筛选规则
   void clear_rules();
   // 重设日志容器筛选规则(javascript调用)
   void setRules_Wrapper(const Napi::CallbackInfo& info);

   // 根据筛选前行数获取日志容器中指定行的日志
   std::string get_log(int line);
   // 根据筛选后行数获取日志容器中指定行的日志
   std::string get_filted_log(int line);
   // 根据筛选前行数获取日志容器中指定行的日志是否被筛选
   bool is_filtered(int line);
   
   // 清空日志容器
   void clear();
   // 清空日志容器(javascript调用)
   void clear_Wrapper(const Napi::CallbackInfo& info);
   // 刷新所有日志的筛选状态
   void refresh_rules();

   // 根据行数获得日志对应的index
   int get_index(const int line);
   // 根据筛选前行数获取日志容器中指定行的日志(javascript调用)
   Napi::Value getUnfilted_Wrapper(const Napi::CallbackInfo& info);
   // 根据筛选后行数获取日志容器中指定行的日志(javascript调用)
   Napi::Value getFilted_Wrapper(const Napi::CallbackInfo& info);
   // 根据筛选前行数获取日志容器中指定行的日志是否被筛选(javascript调用)
   Napi::Value isFilted_Wrapper(const Napi::CallbackInfo& info);
   // 打印调试信息
   Napi::Value debugStr_Wrapper(const Napi::CallbackInfo &info);

private:
   // 筛选后的日志列表，filtedLines[i]=j表示筛选后的日志中的第i行对应logs内部真实id为j的日志
   SearchableRingBuffer<int> filtedLines;
   // 未经筛选的日志列表
   RingBuffer<LogData> logs;

   IndexedSet<MatchPattern> patterns;
   std::vector<MatchRule> rules;
   
   double value_;
   
   bool check_one_rule(const MatchPattern &rule, const int rule_index, LogData &data);
   // 检查日志是否在筛选后的日志中
   bool check_log(LogData &text);
};

#endif