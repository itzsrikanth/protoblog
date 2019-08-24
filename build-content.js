const fs = require('fs');
const path = require('path');
const fm = require('front-matter');
const showdown = require('showdown');
const convertor = new showdown.Converter();

(function filewalker(dir, done) {
    let results = [];
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function (file) {
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                // If directory, execute a recursive call
                if (stat && stat.isDirectory()) {
                    // Add directory to array [comment if you need to remove the directories from the array]
                    results.push(file);
                    filewalker(file, function (err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    const match = /^(.*)\/([\w-]+)\.md/.exec(file);
                    if (match) {
                        fs.readFile(file, 'utf8', (err, content) => {
                            fs.writeFile(
                                `${match[1]}/${match[2]}.html`,
                                convertor.makeHtml(
                                    content.replace(/---(?:.|\n)*---/gm, '')
                                ),
                                err => {
                                    if (err) {
                                        console.error(`Error writing to ${match[1]}/${match[2]}.html`, err);
                                        process.exit(2);
                                    }
                                }
                            );
                            fs.writeFile(
                                `${match[1]}/${match[2]}.json`,
                                JSON.stringify(fm(content), null, 4),
                                err => {
                                    if (err) {
                                        console.error(`Error writing to ${match[1]}/${match[2]}.json`, err);
                                        process.exit(4);
                                    }
                                }
                            );
                        });
                    }
                    results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
}('./content', function (err, data) {
    if (err) { throw err; }
    fs.writeFile('./build.json', JSON.stringify(
        data.filter(filePath => /\.html$/.test(filePath))
            .map(filePath => filePath.replace(`${process.cwd()}/content`, '').replace(/\.[\w]+$/, '')),
        null, 4
    ), err => {
        if (err) {
            console.error(`Error writing to ./build.json`, err);
            process.exit(8);
        }
    })
}));
