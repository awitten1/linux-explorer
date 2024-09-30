
cmake_minimum_required(VERSION 3.22)

project(ioctl_js LANGUAGES CXX)

set (CMAKE_CXX_STANDARD 11)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

add_library(ioctl_js MODULE src/ioctl.cpp)

execute_process(COMMAND node -p "require('node-addon-api').include_dir.trim()" OUTPUT_VARIABLE NODE_CXX_API_PATH)
execute_process(COMMAND node -p "require('node-api-headers').include_dir.trim()" OUTPUT_VARIABLE NODE_API_PATH)

message("hello ${NODE_API_PATH} ${NODE_CXX_API_PATH}")
string(STRIP ${NODE_API_PATH} NODE_API_PATH)
string(STRIP ${NODE_CXX_API_PATH} NODE_CXX_API_PATH)

set_target_properties(ioctl_js PROPERTIES PREFIX "" SUFFIX ".node")

target_include_directories(ioctl_js PRIVATE ${NODE_CXX_API_PATH} ${NODE_API_PATH})

