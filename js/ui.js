(function (window, document) {

    // we fetch the elements each time because docusaurus removes the previous
    // element references on page navigation
    function getElements() {
        return {
            layout: document.getElementById('layout'),
            menu: document.getElementById('menu'),
            menuLink: document.getElementById('menuLink')
        };
    }

    function toggleClass(element, className) {
        var classes = element.className.split(/\s+/);
        var length = classes.length;
        var i = 0;

        for (; i < length; i++) {
            if (classes[i] === className) {
                classes.splice(i, 1);
                break;
            }
        }
        // The className is not found
        if (length === classes.length) {
            classes.push(className);
        }

        element.className = classes.join(' ');
    }

    function toggleAll() {
        var active = 'active';
        var elements = getElements();

        toggleClass(elements.layout, active);
        toggleClass(elements.menu, active);
        toggleClass(elements.menuLink, active);
    }

    function handleEvent(e) {
        var elements = getElements();

        if (e.target.id === elements.menuLink.id) {
            toggleAll();
            e.preventDefault();
        } else if (elements.menu.className.indexOf('active') !== -1) {
            toggleAll();
        }
    }

    document.addEventListener('click', handleEvent);

    // tv
    // https://codepen.io/moklick/pen/zKleC
    var Application = (function () {

        var canvas;
        var ctx;
        var imgData;
        var pix;
        var WIDTH;
        var HEIGHT;
        var flickerInterval;
        var switchTimeout;
        var isOn;
        var self;
        var btnElm;

        var init = function () {
            canvas = document.getElementById('canvas');
            ctx = canvas.getContext('2d');
            canvas.width = WIDTH = 450;
            canvas.height = HEIGHT = 300;
            isOn = true;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
            ctx.fill();
            imgData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
            pix = imgData.data;
            flickerInterval = setInterval(flickering, 50);
            btnElm = document.getElementById('btn');
            btnElm.addEventListener('click', toggleScreen, false);


        };



        var flickering = function () {

            for (var i = 0; i < pix.length; i += 4) {
                var color = (Math.random() * 255) + 50;
                pix[i] = color;
                pix[i + 1] = color;
                pix[i + 2] = color;
            }
            ctx.putImageData(imgData, 0, 0);




        };

        var toggleScreen = function () {


            if (typeof switchTimeout != 'undefined') {
                clearTimeout(switchTimeout);
            }
            if (isOn) {                
                // cut off screen
                clearInterval(flickerInterval);
                document.body.classList.add('screenOff');
                document.getElementById('slack').classList.add('displayNone');
                ctx.fillStyle = '#222';
                ctx.fillRect(0, 0, WIDTH, HEIGHT);
                ctx.fill();
    
            } else {
                document.body.classList.remove('screenOff');
                document.getElementById('slack').classList.remove('displayNone');
                flickerInterval = setInterval(flickering, 50);  
            
            }
            msg.style.opacity = 1;
            switchTimeout = window.setTimeout(function () {
                msg.style.opacity = 0;
            }, 2750);
            isOn = !isOn;
        };

        return {
            init: init
        };
    }());

    Application.init();

}(this, this.document));