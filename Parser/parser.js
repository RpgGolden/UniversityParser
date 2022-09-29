const { parse } = require("dotenv");
const { JSDOM } = require("jsdom");

const axios = require("axios");


module.exports = {
    /**
     * method to parse priem.unecon.ru
     */
    UNECON: parseUnecon = async (searchedSNILS) => {
        const urls = ['https://priem.unecon.ru/stat/stat_konkurs.php?y=2021&filial_kod=1&zayav_type_kod=1&obr_konkurs_kod=0&recomend_type=null&rec_status_kod=all&ob_forma_kod=1&ob_osnova_kod=1&konkurs_grp_kod=3747&prior=all&status_kod=all&has_agreement=all&show=%D0%9F%D0%BE%D0%BA%D0%B0%D0%B7%D0%B0%D1%82%D1%8C',
            'https://priem.unecon.ru/stat/stat_konkurs.php?y=2021&filial_kod=1&zayav_type_kod=1&obr_konkurs_kod=0&recomend_type=null&rec_status_kod=all&ob_forma_kod=1&ob_osnova_kod=1&konkurs_grp_kod=3754&prior=all&status_kod=all&is_orig_doc=all&has_agreement=all&dogovor=all&show=%D0%9F%D0%BE%D0%BA%D0%B0%D0%B7%D0%B0%D1%82%D1%8C'
        ]
        var res = [];
        for (const url of urls){
            var foundRow = false;
            try {
                const response = await axios.get(url);

                const dom = new JSDOM(response.data);

                // get tables from page
                let tables = Array.from(dom.window.document.querySelectorAll('#spisok table'));

                for (const table of tables) {
                    // find indexes of required columns
                    const headRowCells = Array.from(table.querySelectorAll('thead tr td'));
                    const snilsColumnIndex = headRowCells.findIndex(x => x.textContent.trim() === 'СНИЛС');
                    const agreementColumnIndex = headRowCells.findIndex(x => x.textContent.trim() === 'Согласие принято');

                    const rows = Array.from(table.querySelectorAll('tbody tr'))

                    // finding row with required SNILS
                    foundRow = rows.find(row => row.querySelectorAll('td')[snilsColumnIndex].textContent.trim() === searchedSNILS);
                    
                    //finding study direction
                    const stDir = dom.window.document.getElementById('konkurs_grp_kod_id')

                    // if found - return with agreement state
                    if (foundRow) {
                        res.push( {
                            univ: 'СПБГЭУ',
                            typeofStudy: 'Очная',
                            studyDir: stDir.options[stDir.selectedIndex].text,
                            snils: searchedSNILS,
                            agreement: foundRow.querySelectorAll('td')[agreementColumnIndex].textContent.trim() === '+'
                        });
                    }
                }
                // if no rows with SNILS found - return empty result
                if (!foundRow) res.push(null);
            } catch (e) {
                console.error("Unable to parse unecon.ru", e)
            }
        }

<<<<<<< HEAD
        return res;
    }
=======
    UNECON1: parseUnecon = async (searchedSNILS) => {
        const url = `https://priem.unecon.ru/stat/stat_konkurs.php?y=2021&filial_kod=1&zayav_type_kod=1&obr_konkurs_kod=0&recomend_type=null&rec_status_kod=all&ob_forma_kod=1&ob_osnova_kod=1&konkurs_grp_kod=3754&prior=all&status_kod=all&is_orig_doc=all&has_agreement=all&dogovor=all&show=%D0%9F%D0%BE%D0%BA%D0%B0%D0%B7%D0%B0%D1%82%D1%8C`;

        try {
            const response = await axios.get(url);

            const dom = new JSDOM(response.data);

            // get tables from page
            let tables = Array.from(dom.window.document.querySelectorAll('#spisok table'));

            for (const table of tables) {
                // find indexes of required columns
                const headRowCells = Array.from(table.querySelectorAll('thead tr td'));
                const snilsColumnIndex = headRowCells.findIndex(x => x.textContent.trim() === 'СНИЛС');
                const agreementColumnIndex = headRowCells.findIndex(x => x.textContent.trim() === 'Согласие принято');

                const rows = Array.from(table.querySelectorAll('tbody tr'))

                // finding row with required SNILS
                const foundRow = rows.find(row => row.querySelectorAll('td')[snilsColumnIndex].textContent.trim() === searchedSNILS);

                // if found - return with agreement state
                if (foundRow) {
                    return {
                        univ: 'СПБГЭУ',
                        typeofStudy: 'Очная',
                        studyDir: 'Бизнес-информатика',
                        snils: searchedSNILS,
                        agreement: foundRow.querySelectorAll('td')[agreementColumnIndex].textContent.trim() === '+'
                    }
                }
            }

            // if no rows with SNILS found - return empty result
            return null;
        } catch (e) {
            console.error("Unable to parse unecon.ru", e)
        }
    },
    

    SFEDU: parseSFEDU = async (searchedSNILS) => {
        const url = `https://sfedu.ru/abitur/list/rus/list_b/09.03.04_%D0%9A%D0%A2_%D0%9E_%D0%93%D0%91.62`;

        try {
            const response = await axios.get(url);

            const dom = new JSDOM(response.data);

            // get tables from page
            let tables = Array.from(dom.window.document.querySelectorAll('#spisok table'));

            for (const table of tables) {
                // find indexes of required columns
                const headRowCells = Array.from(table.querySelectorAll('thead tr td'));
                const snilsColumnIndex = headRowCells.findIndex(x => x.textContent.trim() === 'Уникальный код');
                const agreementColumnIndex = headRowCells.findIndex(x => x.textContent.trim() === 'Согласие на зачисление');

                const rows = Array.from(table.querySelectorAll('tbody tr'))

                // finding row with required SNILS
                const foundRow = rows.find(row => row.querySelectorAll('td')[snilsColumnIndex].textContent.trim() === searchedSNILS);

                // if found - return with agreement state
                if (foundRow) {
                    return {
                        university: "ЮФУ",
                        dirOfStudy: "Программная инженерия",
                        formOfStudy: "Очная",
                        snils: searchedSNILS,
                        agreement: foundRow.querySelectorAll('td')[agreementColumnIndex].textContent.trim() === '✓'
                    }
                }
            }

            // if no rows with SNILS found - return empty result
            return null;
        } catch (e) {
            console.error("Unable to parse sfedu.ru", e);
        }
    },
>>>>>>> f2ede9ff0521c225d07ee993afeffd78182899c2
}
