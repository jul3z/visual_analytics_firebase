


window.addEventListener('load', function(){
 var usersRef = new Firebase('https://flickering-fire-4257.firebaseio.com/liveview/');
 var userSelect = document.querySelector('#user-select');
 usersRef.on('value', function(snapshot){
   var values = snapshot.val();
   userSelect.innerHTML = '';
   var option = document.createElement('option');
   userSelect.appendChild(option);


   for(var i in values){
      var value = values[i];
      var option = document.createElement('option');
      option.textContent = i;
      option.value = i;

      userSelect.appendChild(option);
   }

 });
 userSelect.addEventListener('change', function(event){
   var val = event.target.value;
   console.log('select');
   selectUser(val);
 });
});



function selectUser(userid){
   var iframe = document.querySelector('.view__iframe');
  var href = document.querySelector('.top-bar .href');
  var cursor = document.querySelector('.cursor');
  var myDataRef = new Firebase('https://flickering-fire-4257.firebaseio.com/liveview/'+userid+'/events');
  var viewerStyle = null;
  iframe.loaded = false;

  var arrDoOnIframeLoad = [];
  iframe.addEventListener('load', function(){
    iframe.loaded = true;
    var func = null;
    while(func = arrDoOnIframeLoad.pop()){
      func();
    }

    console.log('iframe loaded');
  });

  var doWhenLoaded = function(func){
    if(iframe.loaded)
        func();

      arrDoOnIframeLoad.push(func);
  };

  var addViewerStyle = function(css){
    if(viewerStyle == null){
      viewerStyle = iframe.contentDocument.createElement('style');
      viewerStyle.type = 'text/css';
      iframe.contentDocument.querySelector('head').appendChild(viewerStyle);
    }

    var textNode = iframe.contentDocument.createTextNode(css);

    viewerStyle.appendChild(textNode);
  };

  var displayEvent = function (value, isSnapshot){


      isSnapshot = isSnapshot || true;

      if(isSnapshot)
        value = value.val();


      if(value.type == 'config'){

        iframe.style.width = value.screenX + 'px';
        iframe.style.height = value.screenY + 'px';

        if(value.html){
          iframe.loaded = false;
          iframe.srcdoc = value.html.replace('<!-- viewer_base_code -->', '<base href="'+ value.href +'">');


          setTimeout(function(){



            for(var i in iframe.contentDocument.styleSheets){
            var styleSheet = iframe.contentDocument.styleSheets[i];
            for(var iRule in styleSheet.cssRules){
              var rule = styleSheet.cssRules[iRule];

              if(rule.cssText != undefined && rule.cssText.indexOf(':hover') >= 0){
                addViewerStyle(rule.cssText.replace(':hover', '.simulate-hover'));
              }

            }

          }
          },1000);

        }
        href.innerHTML = value.href;
      } else if(value.type == 'click'){



        requestAnimationFrame(function(){
          cursor.style.background = 'red';
          setTimeout(function(){
            requestAnimationFrame(function(){
              cursor.style.background = '';
            });
          }, 300);
        })


      } else if(value.type == 'movecursor'){
        requestAnimationFrame(function(){
          cursor.style.transform = 'translate('+value.X+'px, '+value.Y+'px)';
        });
      } else if(value.type == 'scroll'){
        if(value.target == 'document'){
          iframe.contentWindow.scrollTo(value.X, value.Y);
        }
      } else if(value.type == 'mouseover'){

        iframe.contentDocument.querySelector('.' + value.uid).classList.add('simulate-hover');
      } else if(value.type == 'mouseout'){
        iframe.contentDocument.querySelector('.' + value.uid).classList.remove('simulate-hover');
      } else if(value.type == 'attribute_changed'){
        if(value.attrValue == undefined)
          value.attrValue = null;

          doWhenLoaded(function(){
            iframe.contentDocument.querySelector('.' + value.uid).setAttribute(value.attr, value.attrValue);
          });
      } else if(value.type == 'focus'){
        iframe.contentDocument.querySelector('.' + value.uid).focus();
      } else if(value.type == 'blur'){
        iframe.contentDocument.querySelector('.' + value.uid).blur();
      } else if(value.type == 'input'){
        iframe.contentDocument.querySelector('.' + value.uid).value = value.value;
      } else if(value.type == 'innerHTML_changed'){
        iframe.contentDocument.querySelector('.' + value.uid).innerHTML = value.html;
      }

  }


  myDataRef.on('child_added', displayEvent);
}