import _ from "lodash";

export default class DataProcessor {

    #dataProvider;

    constructor(dataProvider) {
        this.#dataProvider = dataProvider;
    }

    /**
     * 
     * @returns array[{"continent","confirmed","deaths","vaccinated"}];
     */
    async getStatisticsContinents() {
        
        const objCases = await this.#dataProvider.getCasesData();
        const arrCases = this.#parseObjCases(objCases);
        const objVaccines = await this.#dataProvider.getVaccinesData();
        const arrVaccines = this.#parseObjVaccines(objVaccines);
        const arrMerge = _.merge(arrCases, arrVaccines);

        const objContinent = _.groupBy(arrMerge, (e) => {
            return e.continent;
        });
        const arrRate = this.#getArrRate(objContinent);

        return arrRate;
    }

    #parseObjCases(objCases){
        const arrCases = [];
        for (const key in objCases) {
            
            arrCases.push({
                "country": key,
                "confirmed": objCases[key].All.confirmed,
                "deaths": objCases[key].All.deaths,
                "population": objCases[key].All.population,
                "continent": objCases[key].All.continent
            });
        }
        return arrCases;
    }

    #parseObjVaccines(objVaccines){
        const arrVaccines = [];
        for (const key in objVaccines) {
            arrVaccines.push({
                "country": key,
                "vaccinated": objVaccines[key].All.people_vaccinated
            });
        }
        return arrVaccines;
    }

    #getArrRate(objContinent){
        const arrRate = [];
        Object.entries(objContinent)
        .forEach((e) => { 
            const acc = {population:0, confirmed:0, deaths:0, vaccinated:0};
            e[1].forEach((v) => {
                if(v.continent === undefined) {
                    return;
                }
                let population = (v.population === undefined) ? 0 : v.population;
                let vaccinated = (v.vaccinated === undefined) ? 0 : v.vaccinated;
                let confirmed = (v.confirmed === undefined) ? 0 : v.confirmed;
                let deaths = (v.deaths === undefined) ? 0 : v.deaths;
                acc.population += population;
                acc.confirmed += confirmed;
                acc.deaths += deaths;
                acc.vaccinated += vaccinated;
            })
            if(e[0]!='undefined'){
            arrRate.push({ "continent":e[0],
            "confirmed":acc.confirmed/acc.population,
             "deaths":acc.deaths/acc.population,
              "vaccinated":acc.vaccinated/acc.population});
            }
        });
        return arrRate;
    }


}