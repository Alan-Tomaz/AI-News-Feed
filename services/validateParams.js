/**
 * 
 * @param {Object} param0 A object with params to be validated.
 * @param {Boolean} geralSearch Check if the search is general or not. Case yes, will not validate the searchTerms of the first parameter.
 * @returns 
 */
export const validateParams = ({ searchTerms, trustSources, summaryRig, language, articlesLimit, articlesDate, sendSeparately, articles }, geralSearch) => {

    if (geralSearch == false) {
        if (!searchTerms || searchTerms == undefined || searchTerms == null) {
            return { error: 'Search terms are required.' };
        }
        if (searchTerms.length === 0) {
            return { error: 'Search terms are required.' };
        }
    }

    if (!trustSources || trustSources == undefined || trustSources == null) {
        trustSources = [];
    }

    if (!summaryRig || summaryRig == undefined || summaryRig == null) {
        summaryRig = 'medium';
    }

    if (summaryRig != 'low' && summaryRig != 'medium' && summaryRig != 'high') {
        return { error: 'Invalid summary rig. It must be low, medium or high.' };
    }

    if (!language || language == undefined || language == null) {
        language = 'en';
    }

    if (language != 'pt' && language != 'en') {
        return { error: 'Invalid language. It must be pt or en.' };
    }

    if (!articlesLimit || articlesLimit <= 0 || articlesLimit == undefined || articlesLimit == null) {
        articlesLimit = 5;
    }

    if (Number(articlesLimit).typeof == 'number') {
        return { error: 'Invalid articles limit. It must be a number.' };
    }

    if (!articlesDate || articlesDate == undefined || articlesDate == null) {
        articlesDate = 'recent';
    }

    if (articlesDate != 'recent' && articlesDate != 'week' && articlesDate != 'month') {
        return { error: 'Invalid articles date. It must be recent, week or month.' };
    }

    if (!sendSeparately || sendSeparately == undefined || sendSeparately == null) {
        sendSeparately = false;
    }

    if (sendSeparately != true && sendSeparately != false) {
        return { error: 'Invalid send separately. It must be true or false.' };
    }

    if (geralSearch == true) {
        if (!articles || articles == undefined || articles == null) {
            return { error: 'Articles are required. It must be a array of objects: `{articleType: "Economy", searchTerms: ["economic, inflation"]}`' };
        }

        if (articles.length == 0) {
            return { error: 'Articles are required. It must be a array of objects: `{articleType: "Economy", searchTerms: ["economic, inflation"]}`' };
        }

        articles.forEach(element => {
            if (element.articlesType == undefined || element.articlesType == null || element.articlesType == '') {
                return { error: 'Invalid articles type. It must be a string.' };
            }
            if (element.searchTerms == undefined || element.searchTerms == null || element.searchTerms == '') {
                return { error: 'Invalid search terms. It must be a array of strings.' };
            }
            if (element.searchTerms.length === 0) {
                return { error: 'Search terms are required.' };
            }
        });
    }

    return { searchTerms, trustSources, summaryRig, language, articlesLimit, articlesDate, sendSeparately, articles };
}