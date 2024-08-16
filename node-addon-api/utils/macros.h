#ifndef MACRO_H
#define MACRO_H

#define ADD_INSTANCE_METHOD(class_name, method_name) \
    InstanceMethod(#method_name, &class_name::method_name##_Wrapper)

#define THROW_EXCEPTION(env, message) \
    Napi::Error::New(env, message).ThrowAsJavaScriptException()

#define EXPORT_CONSTANT_NUMBER(target, constant) \
    target.DefineProperty(Napi::PropertyDescriptor::Value(#constant, Napi::Number::New(env, constant), napi_enumerable))

#define CHECK_FUNCTION(info, length, returnValue ) \
    Napi::Env env = info.Env(); \
    if (info.Length() < length) \
    { \
        Napi::Error::New(env, "Expected " #length " arguments").ThrowAsJavaScriptException(); \
        return returnValue; \
    }

#define GET_ARRAY_PARAM(info, env, index, array, returnValue) \
    if (!info[index].IsArray()) \
    { \
        Napi::Error::New(env, "Argument " #index " must be an array").ThrowAsJavaScriptException(); \
        return returnValue; \
    } \
    Napi::Array array = info[index].As<Napi::Array>();

#define GET_STR_PARAM(info, env, index, cstr, returnValue) \
    std::string cstr; \
    if (info[index].IsString()) \
    { \
        cstr = info[index].As<Napi::String>().Utf8Value(); \
    } \
    else \
    { \
        Napi::Error::New(env, "Argument " #index " must be a string").ThrowAsJavaScriptException(); \
        return returnValue; \
    }

#define GET_BOOL_PARAM(info, env, index, bool_var, returnValue) \
    bool bool_var; \
    if (info[index].IsBoolean()) bool_var = info[index].As<Napi::Boolean>().Value(); \
    else \
    { \
        Napi::Error::New(env, "Argument " #index " must be a boolean").ThrowAsJavaScriptException(); \
        return returnValue; \
    }

#define GET_INT_PARAM(info, env, index, int_var, returnValue) \
    int int_var; \
    if (info[index].IsNumber()) int_var = info[index].As<Napi::Number>().Int32Value(); \
    else \
    { \
        Napi::Error::New(env, "Argument " #index " must be a number").ThrowAsJavaScriptException(); \
        return returnValue; \
    }

#define ASSERT_AND_THROW(condition, message, returnValue) \
    if (!(condition)) \
    { \
        Napi::Error::New(env, message).ThrowAsJavaScriptException(); \
        return returnValue; \
    }

#endif
