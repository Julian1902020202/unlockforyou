        function resizeCanvas() {
            const canvas = document.getElementById('canv');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // Re-initialize the matrix animation with new dimensions
            initializeMatrix();
        }

        window.addEventListener('resize', resizeCanvas, false);
        window.addEventListener('load', resizeCanvas, false);

        // Get the canvas node and the drawing context
        const canvas = document.getElementById('canv');
        const ctx = canvas.getContext('2d');

        let w, h, cols, ypos;

        function initializeMatrix() {
            // set the width and height of the canvas
            w = canvas.width;
            h = canvas.height;

            // draw a black rectangle of width and height same as that of the canvas
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, w, h);

            cols = Math.floor(w / 20) + 1;
            ypos = Array(cols).fill(0);
        }

        function matrix() {
            // Draw a semitransparent black rectangle on top of previous drawing
            ctx.fillStyle = '#0001';
            ctx.fillRect(0, 0, w, h);

            // Set color to green and font to 15pt monospace in the drawing context
            ctx.fillStyle = '#0f0';
            ctx.font = '15pt monospace';

            // for each column put a random character at the end
            ypos.forEach((y, ind) => {
                // generate a random character
                const text = String.fromCharCode(Math.random() * 128);

                // x coordinate of the column, y coordinate is already given
                const x = ind * 20;
                // render the character at (x, y)
                ctx.fillText(text, x, y);

                // randomly reset the end of the column if it's at least 100px high
                if (y > 100 + Math.random() * 10000) ypos[ind] = 0;
                // otherwise just move the y coordinate for the column 20px down,
                else ypos[ind] = y + 20;
            });
        }

        // Initialize the canvas size and matrix effect on load
        resizeCanvas();
       // Render the animation at 20 FPS
        setInterval(matrix, 50);

