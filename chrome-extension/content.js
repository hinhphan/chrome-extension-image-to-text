var isDraw = false;
var startPoint = {
  x: 0,
  y: 0
};
var endPoint = {
  x: 0,
  y: 0
};

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect(),
    scaleX = canvas.width / rect.width,
    scaleY = canvas.height / rect.height;

  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY
  }
}

function startDraw(event) {
  isDraw = true;
  // console.log('start');
  // console.log(event);

  startPoint = getMousePos(event.target, event)
}

function moveDraw(event) {
  if (isDraw) {
    // console.log('move');
    // console.log(event);

    endPoint = getMousePos(event.target, event)
  }
}

function endDraw(event) {
  if (isDraw) {
    // console.log('end');
    // console.log(event);
    isDraw = false;

    if ((startPoint.x >= endPoint.x) || (startPoint.y >= endPoint.y)) {
      return
    }

    endPoint = getMousePos(event.target, event)

    doTransImage(event.target);

    let canvas = event.target
    var ctx = canvas.getContext("2d")

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(startPoint.x, startPoint.y, endPoint.x - startPoint.x, endPoint.y - startPoint.y);
  }
}

async function doTransImage(canvas) {
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = endPoint.x - startPoint.x;
  tmpCanvas.height = endPoint.y - startPoint.y;

  var ctx = tmpCanvas.getContext("2d");
  ctx.drawImage(canvas, startPoint.x, startPoint.y, tmpCanvas.width, tmpCanvas.height, 0, 0, tmpCanvas.width, tmpCanvas.height);

  const base64ImgInput = tmpCanvas.toDataURL();

  const response = await fetch('http://localhost:2323', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "mode": 'no-cors'
    },
    body: JSON.stringify({
      input: base64ImgInput
    })
  })

  const res = await response.json();

  fetch(res.output).then(res => res.blob()).then((blob) => {
    const img = new Image()
    img.src = URL.createObjectURL(blob)
    img.alt = 'output'

    img.onload = function() {
      var ctx = canvas.getContext("2d")
      ctx.drawImage(img, startPoint.x, startPoint.y)
      canvas.title = res.text
    }
  })
}

chrome.storage.local.get(["itt_capture"]).then((result) => {
  if (Object.hasOwnProperty.call(result, 'itt_capture')) {
    const image = result['itt_capture'];
    const body = document.getElementsByTagName('body')[0]

    body.style.position = 'relative'
    body.style.height = '100%'
    body.style.overflow = 'hidden'

    let scrollTop = document.getElementsByTagName('html')[0].scrollTop || body.scrollTop
    let divOverlayCapture = document.createElement('div')
    divOverlayCapture.classList.add('itt-capture')
    divOverlayCapture.style.position = 'absolute'
    divOverlayCapture.style.top = scrollTop + 'px'
    divOverlayCapture.style.left = 0
    divOverlayCapture.style.right = 0
    divOverlayCapture.style.zIndex = 9999999999

    let canvas = document.createElement('canvas')

    var ctx = canvas.getContext("2d")

    let img = new Image()
    img.src = image
    img.alt = 'capture'

    img.onload = function() {
      canvas.setAttribute('width', img.width + 'px')
      canvas.setAttribute('height', img.height + 'px')

      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height)
      
      // ctx.fillStyle = "rgba(0,0,0,0.6)";
      // ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    canvas.onmousedown = startDraw
    canvas.onmousemove = moveDraw
    canvas.onmouseup = endDraw
    
    divOverlayCapture.appendChild(canvas)
    body.appendChild(divOverlayCapture)

    document.onkeydown = function(e) {
      if (e.which === 27) {
        divOverlayCapture.remove()
        body.style.position = ''
        body.style.height = ''
        body.style.overflow = ''
      }
    }
  }
});