var AjaxRequest = function(method,url,callback,data) {
  var xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = callback
  xhttp.open(method,url,true)
  if(data) xhttp.send(data)
  else     xhttp.send()
}