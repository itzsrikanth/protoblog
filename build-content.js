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
                    // results.push(file);
                    filewalker(file, function (err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    // const match = /^(.*)\/([\w-]+)\.md/.exec(file);
                    // if (match) {
                    results.push(file);
                    // } else {
                    // results.push(file);
                    // }
                    // results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
}('./content', function (err, data) {
    if (err) {
        throw err;
    } else {
        fs.writeFile('./build.json', JSON.stringify(
            data.filter(file => /\.md/.test(file))
                .map(file => {
                    const content = fs.readFileSync(file, 'utf8');
                    return {
                        content: convertor.makeHtml(
                            content.replace(/---(?:.|\n)*---/gm, '')
                        ),
                        metadata: fm(content),
                        slug: file.replace(`${process.cwd()}/content`, '')
                            .replace(/\.\w+$/, '')
                    };
                }),
            null, 4
        ), err => {
            if (err) {
                console.error(`Error writing to ./build.json`, err);
                process.exit(8);
            } else {
                console.log('Build completed successfully..!')
            }
        });
    }
    //  results.push({
    // });

}));
