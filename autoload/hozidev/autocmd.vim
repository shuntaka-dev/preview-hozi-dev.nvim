function! hozidev#autocmd#init() abort
  execute 'augroup HOZIDEV_REFRESH_INIT' . bufnr('%')
    autocmd!
    autocmd BufWritePost <buffer> :call hozidev#rpc#refresh_content()
    autocmd CursorHold,CursorHoldI,CursorMoved,CursorMovedI <buffer> :call hozidev#rpc#refresh_content()
    autocmd VimLeave * call hozidev#rpc#stop_server()
  augroup END
endfunction
