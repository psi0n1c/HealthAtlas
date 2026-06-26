let dashboard
let dashboardSidebar
let moreInfo
let moreInfoSidebar
let compare
let compareSidebar

let spotlightContinent
let spotlightCapital
let spotlightPopulation
let spotlightCountry
let impact

let dropdown

let totalCountryCases
let totalCountryDeaths
let totalCountryRecovered

let map
let chart
let tableBody

let countryCurrency
let countryLanguage
let countryContinent
let countryTimezone

let mapIframe

let allCountryData


document.addEventListener('DOMContentLoaded', async () => {
    initializeElements()
    try {
        const response = await fetch('https://disease.sh/v3/covid-19/countries/mk?strict=true')

        if (!response.ok) {
            throw new Error("Failed to fetch data at DOM load")
        }

        const data = await response.json()

        console.log(data)

        fillInformation(data)

        await fillDropdown()

        dropdown.addEventListener("change", handleDropdownChange)

    } catch (error) {
        console.log("Error fetching data at DOM load:", error)
    }
})

function initializeElements() {
    dashboard = document.getElementById('dashboard')
    dashboardSidebar = document.getElementById('dashboard-link')
    moreInfo = document.getElementById('moreInfo')
    moreInfoSidebar = document.getElementById('information-link')
    compare = document.getElementById('compare')
    compareSidebar = document.getElementById('compare-link')

    spotlightContinent = document.getElementById('continent') // done
    spotlightCapital = document.getElementById('capital')
    spotlightPopulation = document.getElementById('population') // done

    dropdown = document.getElementById('country-dropdown') // done

    spotlightCountry = document.getElementById('country-spotlight-name') // done

    impact = document.getElementById('impact')

    totalCountryCases = document.getElementById('total-cases') // done
    totalCountryDeaths = document.getElementById('total-deaths') // done
    totalCountryRecovered = document.getElementById('total-recovered') // done

    map = document.getElementById('country-map') // done
    chart = document.getElementById('line-chart')

    tableBody = document.getElementById('countries-table')

    countryCurrency = document.getElementById('currency')
    countryLanguage = document.getElementById('language')
    countryContinent = document.getElementById('continent-fact') // done
    countryTimezone = document.getElementById('timezone')

    mapIframe = document.getElementById('country-map')
}

function fillInformation(data) {
    totalCountryCases.textContent = formatNumber(data.cases)
    totalCountryDeaths.textContent = formatNumber(data.deaths)
    totalCountryRecovered.textContent = formatNumber(data.recovered)

    spotlightContinent.textContent = data.continent
    spotlightCountry.textContent = data.country
    spotlightPopulation.textContent = formatNumber(data.population)

    impact.textContent = calculateImpact(data)
    applyImpactColors(impact.textContent)

    mapIframe.setAttribute('src', `https://www.google.com/maps?q=${encodeURIComponent(data.country)}&output=embed`)


    countryContinent.textContent = data.continent
}

function formatNumber(number) {
    if (number > 999999 && number < 1000000000) {
        number = (number / 1000000).toFixed(1) + "M"
    }
    else if (number >= 1000000000) {
        number = (number / 1000000000).toFixed(1) + "B"
    }
    return number
}

async function fillDropdown() {
    try {
        const response = await fetch('https://disease.sh/v3/covid-19/countries')

        if (!response.ok) {
            throw new Error("Failed to fetch data for dropdown")
        }

        const data = await response.json()

        console.log(data)

        allCountryData = data

        data.forEach(element => {
            let name = element.country
            let iso2 = element.countryInfo.iso2

            let option = document.createElement('option')
            option.value = iso2
            option.textContent = name


            if (iso2 === "MK") {
                option.selected = true
            }

            dropdown.appendChild(option)  
        })

    } catch (error) {
        console.log("Error fetching data for dropdown:", error)
    }
}

function handleDropdownChange() {
    const selectedIso2 = dropdown.value

    const selectedCountry = allCountryData.find(country => country.countryInfo.iso2 === selectedIso2)

    if(!selectedCountry){
        console.log("Country not found")
        return
    }

    fillInformation(selectedCountry)
}

function togglePage(page) {
    switch(page){
        case 'dashboard':
            dashboard.classList.remove("hidden")
            dashboard.classList.add("active")
            moreInfo.classList.add("hidden")
            moreInfoSidebar.classList.remove("active")
            compare.classList.add("hidden")
            compareSidebar.classList.remove("active")
            break
        case 'moreInfo':
            dashboard.classList.add("hidden")
            dashboardSidebar.classList.remove("active")
            moreInfo.classList.remove("hidden")
            moreInfoSidebar.classList.add("active")
            compare.classList.add("hidden")
            compareSidebar.classList.remove("active")
            break
        default:
            dashboard.classList.add("hidden")
            dashboardSidebar.classList.remove("active")
            moreInfo.classList.add("hidden")
            moreInfoSidebar.classList.remove("active")
            compare.classList.remove("hidden")
            compareSidebar.classList.add("active")
            break
    }
}

function calculateImpact(data){
    const casesPerOneMillion = data.casesPerOneMillion ?? 0
    const deathsPerOneMillion = data.deathsPerOneMillion ?? 0

    if (casesPerOneMillion >= 250000 || deathsPerOneMillion >= 10000){
        return "High Impact"
    }
    if (casesPerOneMillion >= 100000 || deathsPerOneMillion >= 5000){
        return "Medium Impact"
    }
    return "Low Impact"
}

function applyImpactColors(impactLevel) {
    if (impactLevel === "High Impact") {
        impact.style.color = "var(--high-impact-text)"
        impact.style.backgroundColor = "var(--high-impact-bg)"
    } else if (impactLevel === "Medium Impact") {
        impact.style.color = "var(--medium-impact-text)"
        impact.style.backgroundColor = "var(--medium-impact-bg)"
    } else {
        impact.style.color = "var(--low-impact-text)"
        impact.style.backgroundColor = "var(--low-impact-bg)"
    }
}