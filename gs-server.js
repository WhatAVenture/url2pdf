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
        const cairoOutput = input + '_cairo.pdf';

        const cairoResult = spawnSync('pdftocairo', [
            '-pdf',
            '-origpagesizes',
            input,
            cairoOutput
        ], { stdio: 'pipe' });

        console.log('pdftocairo stderr:', cairoResult.stderr?.toString());
        console.log('pdftocairo status:', cairoResult.status);

        if (cairoResult.status !== 0) {
            throw new Error('pdftocairo error: ' + cairoResult.stderr?.toString());
        }

        const qpdfResult = spawnSync('qpdf', [
            '--linearize',
            '--object-streams=disable',
            '--normalize-content=n',
            '--min-version=1.4',
            cairoOutput,
            output
        ], { stdio: 'pipe' });

        console.log('qpdf stderr:', qpdfResult.stderr?.toString());
        console.log('qpdf status:', qpdfResult.status);

        if (qpdfResult.status !== 0 && qpdfResult.status !== 3) {
            throw new Error('qpdf error: ' + qpdfResult.stderr?.toString());
        }

        res.setHeader('Content-Type', 'application/pdf');
        fs.createReadStream(output).pipe(res).on('finish', () => {
            [input, cairoOutput, output].forEach(f => { try { fs.unlinkSync(f); } catch (_) {} });
        });
    } catch (e) {
        console.error(e);
        [input, input + '_cairo.pdf', output].forEach(f => { try { fs.unlinkSync(f); } catch (_) {} });
        res.status(500).send(e.message);
    }
});

app.listen(3001, () => console.log('PDF cleanup service on 3001'));