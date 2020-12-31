let g:hozidev_root_dir = expand('<sfile>:h:h:h')

function! hozidev#util#job_command()
  let node_path = get(g:, 'hozidev_node_path', 'node') 
  return [node_path] + [g:hozidev_root_dir . '/app/lib/server.js']
endfunction

function! hozidev#util#echo_messages(hl, msgs)
  if empty(a:msgs) | return | endif
  execute 'echohl '.a:hl
  if type(a:msgs) ==# 1
    echomsg a:msgs
  else
    for msg in a:msgs
      echom msg
    endfor
  endif
  echohl None
endfunction

function! hozidev#util#preview_hozidev()
  let l:server_status = hozidev#rpc#server_status()
  if l:server_status !=# 1
    call hozidev#rpc#start_server()
  else
    call hozidev#rpc#open_browser()
  endif
endfunction
