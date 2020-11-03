function(target_private_emscripten_options TARGETNAME)
  list(REMOVE_AT ARGV 0)
  target_compile_options(${TARGETNAME} PRIVATE ${ARGV})
  target_link_options(${TARGETNAME} PRIVATE ${ARGV})
endfunction(target_private_emscripten_options)

function(embuild TARGETNAME)
  list(REMOVE_AT ARGV 0)
  set(CURRENT_TYPE "")
  set(COMMONFLAGS "")
  set(DEBFLAGS "")
  set(RELFLAGS "")

  foreach(arg ${ARGV})
    if(arg MATCHES "COMMONFLAGS")
      set(CURRENT_TYPE "COMMONFLAGS")
    elseif(arg MATCHES "DEBFLAGS")
      set(CURRENT_TYPE "DEBFLAGS")
    elseif(arg MATCHES "RELFLAGS")
      set(CURRENT_TYPE "RELFLAGS")
    else()
      list(APPEND ${CURRENT_TYPE} ${arg})
    endif()
  endforeach()

  list(LENGTH COMMONFLAGS CFLEN)
  if(NOT ${CFLEN} MATCHES 0)
    target_private_emscripten_options(${TARGETNAME} ${COMMONFLAGS})
  endif()

  if(${CMAKE_BUILD_TYPE} MATCHES "Debug")
    list(LENGTH DEBFLAGS DBLEN)
    if(NOT ${DBLEN} MATCHES 0)
      target_private_emscripten_options(${TARGETNAME} ${DEBFLAGS})
    endif()
  else()
    list(LENGTH RELFLAGS RLLEN)
    if(NOT ${RLLEN} MATCHES 0)
      target_private_emscripten_options(${TARGETNAME} ${RELFLAGS})
    endif()
  endif()
endfunction(embuild)

if(${CMAKE_BUILD_TYPE} MATCHES "Debug")
  foreach(var
    CMAKE_C_FLAGS_DEBUG
    CMAKE_CXX_FLAGS_DEBUG
  )
    string(REPLACE "-g" "-g4 --source-map-base ./" ${var} "${${var}}")
    message(STATUS "${var}:${${var}}")
  endforeach()
else()
  foreach(var
    CMAKE_C_FLAGS_RELEASE
    CMAKE_CXX_FLAGS_RELEASE
    CMAKE_EXE_LINKER_FLAGS_RELEASE
  )
    string(REPLACE "-O2" "-O3" ${var} "${${var}}")
    message(STATUS "${var}:${${var}}")
  endforeach()
endif()
