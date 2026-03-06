const express = require('express');
const multer = require('multer');
const { execSync } = require('child_process');
const fs = require('fs');
const app = express();
const upload = multer({ dest: '/tmp/' });

app.post('/flatten', upload.single('pdf'), (req, res) => {
    const input = req.file.path;
    const output = input + '_flat.pdf';
    try {
        execSync(`gs -dBATCH -dNOPAUSE -sDEVICE=pdfwrite \
            -dCompatibilityLevel=1.4 \
            -dPDFSETTINGS=/printer \
            -dEmbedAllFonts=true \
            -dSubsetFonts=true \
            -dCompressFonts=true \
            -sOutputFile=${output} ${input}`);
        res.setHeader('Content-Type', 'application/pdf');
        fs.createReadStream(output).pipe(res).on('finish', () => {
            fs.unlinkSync(input);
            fs.unlinkSync(output);
        });
    } catch (e) {
        res.status(500).send(e.message);
    }
});

app.listen(3001, () => console.log('Ghostscript service on 3001'));

