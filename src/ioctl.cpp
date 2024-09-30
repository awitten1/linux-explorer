#include "napi.h"
#include <cstring>
#include <sys/ioctl.h>
#include <linux/nsfs.h>
#include <iostream>

Napi::Value Ioctl(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  if (info.Length() < 1) {
    Napi::TypeError::New(env, "Must provide a file descriptor.")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  if (info.Length() < 2) {
    Napi::TypeError::New(env, "Must provide on operation.")
        .ThrowAsJavaScriptException();
    return env.Null();
  }

  if (!info[0].IsNumber() || !info[1].IsNumber()) {
    Napi::TypeError::New(env, "File descriptor and op must be numbers.").ThrowAsJavaScriptException();
    return env.Null();
  }

  double fd = info[0].As<Napi::Number>().Int64Value();
  double op = info[1].As<Napi::Number>().Int64Value();

  int ret = ioctl(fd, op);
  if (ret == -1) {
    Napi::TypeError::New(env, strerror(errno)).ThrowAsJavaScriptException();
    return env.Null();
  }

  return Napi::Number::New(env, ret);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "ioctl"), Napi::Function::New(env, Ioctl));
  exports.Set(Napi::String::New(env, "NS_GET_NSTYPE"), Napi::Number::New(env, NS_GET_NSTYPE));
  exports.Set(Napi::String::New(env, "CLONE_FILES"), Napi::Number::New(env, CLONE_FILES));
  exports.Set(Napi::String::New(env, "CLONE_FS"), Napi::Number::New(env, CLONE_FS));
  exports.Set(Napi::String::New(env, "CLONE_NEWCGROUP"), Napi::Number::New(env, CLONE_NEWCGROUP));
  exports.Set(Napi::String::New(env, "CLONE_NEWIPC"), Napi::Number::New(env, CLONE_NEWIPC));
  exports.Set(Napi::String::New(env, "CLONE_NEWNET"), Napi::Number::New(env, CLONE_NEWNET));
  exports.Set(Napi::String::New(env, "CLONE_NEWPID"), Napi::Number::New(env, CLONE_NEWPID));

  return exports;
}

NODE_API_MODULE(addon, Init)