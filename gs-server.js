const express = require('express');
const multer = require('multer');
const { spawnSync } = require('child_process');
const fs = require('fs');
const app = express();
const upload = multer({ dest: '/tmp/' });

app.post('/flatten', upload.single('pdf'), (req, res) => {
    const input = req.file.path;
    const output = input + '_flat.pdf';
    try {
        const result = spawnSync('gs', [
            '-dBATCH',
            '-dNOPAUSE',
            '-sDEVICE=pdfwrite',
            '-dCompatibilityLevel=1.4',
            '-dPDFSETTINGS=/printer',
            '-dEmbedAllFonts=true',
            '-dSubsetFonts=true',
            '-dCompressFonts=true',
            '-dNOPLATFONTS',
            '-dFastWebView=true',
            '-dPassThroughJPEGImages=true',
            '-dHaveTransparency=false',
            '-dNOTRANSPARENCY=true',
            '-dFlattenTransparency=true',
            `-sOutputFile=${output}`,
            '-c',
            '[/Title (Document) /Author () /Subject () /Keywords () /Creator (Ghostscript) /Producer (Ghostscript) /CreationDate (D:20240101000000) /ModDate (D:20240101000000) /DOCINFO pdfmark [/MarkInfo << /Marked false >> /DOCINFO pdfmark',
            '-f',
            input
        ], { stdio: 'pipe' });

        console.log('GS stdout:', result.stdout?.toString());
        console.log('GS stderr:', result.stderr?.toString());
        console.log('GS status:', result.status);
        console.log('GS error:', result.error);

        if (result.status !== 0 || result.error) {
            throw new Error('Ghostscript error: ' + (result.stderr?.toString() || result.error?.message));
        }

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

