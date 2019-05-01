const puppeteer = require('puppeteer');
const tabletojson = require('tabletojson');
const fs = require('fs');
const Push = require( 'pushover-notifications' );

class HintPuppet {
    constructor(username, password, headless = true, delay = 600) {
        this.username = username;
        this.password = password;
        this.headless = headless;
        this.delay = delay * 1000;
        this.timeout = 5000;

    }

    init() {
        (async () => {
            const browser = await puppeteer.launch({headless: this.headless, args: ['--no-sandbox', '--disable-setuid-sandbox']});

            const page = await browser.newPage();
            await page.goto('https://student.osiris.hro.nl:9021/osiris_student/ToonResultaten.do');

            console.log("Detecting Page");
            this.DetectPage(page);

        })();


    }
    Loop(page){
        (async () => {
        await page.goto('https://student.osiris.hro.nl:9021/osiris_student/ToonResultaten.do');

        console.log("Detecting Page");
        this.DetectPage(page);
        })();
    }

    DetectPage(page){
        (async () => {

        await page.waitForNavigation({timeout: this.timeout}).catch( e => void(0));
        let title = await page.title();

        if (title === 'Login Hogeschool Rotterdam') {
            console.log('Detected Login (' + title +')');
            this.Login(page)
        }
        else if (title === 'OSIRIS - Resultaten') {
            console.log('Detected OSIRIS (' + title +')');
            this.ExtractTable(page)
            }

        })();
    }

    Login(page) {
        (async () => {
            let title = await page.title();
            console.log('Staring Signin on page: ' + title);

            if (title = 'Login Hogeschool Rotterdam') {

                await page.type('#username', this.username);
                await page.type('#password', this.password);

                await page.click('#submit')
            }

            // Wait for redirection
            await page.waitForNavigation({timeout: this.timeout}).catch( e => void(0));
            this.DetectPage(page);


            //await browser.close();
        })();
    }

    ExtractTable(page){
        (async () => {
        const htmlTable = await page.evaluate(() => document.querySelector("#ResultatenPerStudent").innerHTML);

        const tablesAsJson = await tabletojson.convert(htmlTable);
        const firstTableAsJson = await tablesAsJson[1];

            //this.writeNewArray(firstTableAsJson)

            //Compare Old array with new
            await this.compare(firstTableAsJson, await this.readOldArray())
            setTimeout(this.Loop.bind(this, page), this.delay);



        })();


    }

    writeNewArray(array) {
        fs.writeFileSync('grades.json', JSON.stringify(array))
        console.log('Writing Complete');
    }


    readOldArray() {
        var OldArray = fs.readFileSync('grades.json')
        //console.log('Reading Complete');
        return OldArray;
    }

    compare(NewArray, OldArray) {
        var compare = JSON.stringify(NewArray) == OldArray

        //console.log(compare)
        //If arrays dont match, figure out what part is diff
        if(!compare){

            //Convert OldArray from json to array
            let OldArrayParsed = JSON.parse(OldArray);

            let a = NewArray;
            let b = OldArrayParsed;

            var onlyInA = a.filter(this.comparer(b));
            //var onlyInB = b.filter(comparer(a));

            var result = onlyInA;
            result.forEach((Grade) => this.newGrade(Grade['Mutatiedatum'], Grade['2'], Grade['Resultaat']));
            this.writeNewArray(NewArray)
        }}

    newGrade(Date, Class, Grade) {
        console.log("New Grade Detected {" + Date + ": " + Class + " " + Grade + "}");

        var msg = {
            // These values correspond to the parameters detailed on https://pushover.net/api
            // 'message' is required. All other values are optional.
            title: 'OMG Nieuw Cijfer',	// required
            message: Class + ": " + Grade,
            sound: 'bugle',
            priority: 1
        };

        p.send( msg, function( err, result ) {
            if ( err ) {
                throw err
            }})

    }

    comparer(otherArray){
        return function(current){
            return otherArray.filter(
                function(other){
                    //console.log(other['2'] + " - " + current['2'])
                    return other['2'] == current['2'] && other['Mutatiedatum'] == current['Mutatiedatum'] && other['Resultaat'] == current['Resultaat']
                }).length == 0;
        }
    }

}

//Create Push Object
const p = new Push( {user: process.env.PUSHUSER, token: process.env.PUSHTOKEN})

//Create Hint Object
let h = new HintPuppet(process.env.USERNAME, process.env.PASSWORD)

//Gimmy Those Grades!
h.init();
