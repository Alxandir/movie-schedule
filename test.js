const spelling = require('american-english')
 
const uk_word = 'The theatre a production'
let string = 'theatre,';
// console.log(removePunctuation(string));
// let uk_word_to_american = spelling.toUS(uk_word)
console.log(americaniseSentence(uk_word));
// console.log(uk_word_to_american);

function americaniseSentence(input) {
    return input.split(' ').map(p => {
        return americaniseWord(p) ? americaniseWord(p): p
    }).join(' ');
}

function removePunctuation(input) {
    if(input.match(/[!@#$%^&*()-=_+|;':",.<>?']/)) {
        let result = input.match(/[!@#$%^&*()-=_+|;':",.<>?']/);
        let punctuation = result[0];
        let clean = input.substr(0, result.index);
        return {
            clean,
            punctuation
        };
    }
    return null;
}

function americaniseWord (input) {
    let result = removePunctuation(input);
    let punctuation = '';
    let word = input;
    if(result) {
        punctuation = result.punctuation;
        word = result.clean;
    }
    let american = spelling.toUS(word);
    if(american === 'word_not_found') {
        return null;
    } else {
        return american + punctuation;
    }
}

