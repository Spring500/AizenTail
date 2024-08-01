#ifndef MACRO_H
#define MACRO_H

#define ADD_INSTANCE_METHOD(class_name, method_name) \
    InstanceMethod(#method_name, &class_name::method_name##_Wrapper)

#define THROW_EXCEPTION(env, message) \
    Napi::Error::New(env, message).ThrowAsJavaScriptException()
#endif
