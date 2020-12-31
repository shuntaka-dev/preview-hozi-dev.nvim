function! s:start_plugin() abort
  call hozidev#autocmd#init()
  command! -buffer HoziDevPreview call hozidev#util#preview_hozidev()
endfunction

function! s:init() abort
  au BufEnter *.{md} :call s:start_plugin()
endfunction

if !has('nvim')
  call hozidev#util#echo_messages('Error', 'only supported by neovim')
  finish
endif
call s:init()
