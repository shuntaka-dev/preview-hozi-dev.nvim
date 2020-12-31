let s:hozidev_channel_id = -1

function! s:on_stdout(chan_id, msgs, ...) abort
  call hozidev#util#echo_messages('Error', a:msgs)
endfunction
function! s:on_stderr(chan_id, msgs, ...) abort
  call hozidev#util#echo_messages('Error', a:msgs)
endfunction
function! s:on_exit(chan_id, code, ...) abort
  let s:hozidev_channel_id = -1
  " let g:hozidev_node_channel_id = -1
endfunction

function! hozidev#rpc#server_status()
  if s:hozidev_channel_id ==# -1
    return -1
  endif
  return 1
endfunction

function! hozidev#rpc#start_server()
  let job_cmd = hozidev#util#job_command()

  let s:hozidev_channel_id = jobstart(job_cmd, {
        \ 'on_stdout': function('s:on_stdout'),
        \ 'on_stderr': function('s:on_stderr'),
        \ 'on_exit': function('s:on_exit')
        \ })
endfunction

function! hozidev#rpc#stop_server()
  if s:hozidev_channel_id !=# -1
     try
       call jobstop(s:hozidev_channel_id)
     catch /.*/
     endtry
  endif
  echo 's:hozidev_channel_id' . s:hozidev_channel_id
  echo 'g:hozidev_node_channel_id' . g:hozidev_node_channel_id
  let s:hozidev_channel_id = -1
  let g:hozidev_node_channel_id = -1
endfunction

function! hozidev#rpc#open_browser()
  if exists('g:hozidev_node_channel_id') && g:hozidev_node_channel_id !=# -1
    call rpcnotify(g:hozidev_node_channel_id, 'open_browser', { 'bufnr': bufnr('%') })
  endif
endfunction

function! hozidev#rpc#refresh_content()
  if exists('g:hozidev_node_channel_id') && g:hozidev_node_channel_id !=# -1
    call rpcnotify(g:hozidev_node_channel_id, 'refresh_content', { 'bufnr': bufnr('%') })
  endif
endfunction

