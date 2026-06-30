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
    let countryArea
    let countryContinent
    let countryReligion

    let mapIframe

    let allCountryData
    let sortedCountryData

    // DOM CONTENT LOADED --> FILL PAGE WITH STARTING INFO --> FILL DROPDOWN WITH INFO IN THE BACKGROUND

    document.addEventListener('DOMContentLoaded', async () => {
        initializeElements()
        try {
            const response = await fetch('https://disease.sh/v3/covid-19/countries/mk?strict=true')

            if (!response.ok) {
                throw new Error("Failed to fetch data at DOM load")
            }

            const data = await response.json()



            await fillDropdown()
            dropdown.addEventListener("change", handleDropdownChange)

            fillInformation(data)

            const countryProfile = await getCountryProfile(data)
            fillInformationExtra(countryProfile)

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
        countryArea = document.getElementById('area')
        countryContinent = document.getElementById('continent-fact') // done
        countryReligion = document.getElementById('religion')

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

        fillTable(sortedCountryData)


        countryContinent.textContent = data.continent
    }

    function fillInformationExtra(countryProfile) {
    if (!countryProfile) {
        console.log("No country profile found")
        return
    }

    console.log(countryProfile)

    countryCurrency.textContent = `${countryProfile.currencyName ?? "No data"} (${countryProfile.currencyCode ?? "No data"})`
    countryArea.textContent = `${countryProfile.surfaceArea}km²`
    countryContinent.textContent = countryProfile.continent
    countryReligion.textContent = countryProfile.religion ?? "No data"
    spotlightCapital.textContent = countryProfile.capitalCity
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


            allCountryData = data

            sortedCountryData = sortCountries(allCountryData)

            const dropdownData = [...data].sort((a, b) => a.country.localeCompare(b.country))

            dropdownData.forEach(element => {
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

    async function handleDropdownChange() {
        const selectedIso2 = dropdown.value

        const selectedCountry = allCountryData.find(country => country.countryInfo.iso2 === selectedIso2)

        if(!selectedCountry){
            console.log("Country not found")
            return
        }

        const countryProfile = await getCountryProfile(selectedCountry)

        fillInformation(selectedCountry)
        fillInformationExtra(countryProfile)
    }

    async function getCountryProfile(country) {
        try {
            const countryIso = country.countryInfo.iso2
            const response = await fetch(`https://geoapi.info/api/country?code=${countryIso}`)

            if (!response.ok) {
                throw new Error("Failed to fetch data for country")
            }

            const data = await response.json()


            return data

        } catch (error) {
            console.log("Error fetching data for country:", error)
            alert("Error fetching profile data for country ")
        }
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

    function sortCountries(countries) {  
        return [...countries].sort((a, b) => b.cases - a.cases)
    }

    function fillTable(countries) {
        tableBody.innerHTML = ""

        for (let i = 0; i < 4; i++){
            let row = document.createElement('tr')
            let data1 = document.createElement('td')
            let data2 = document.createElement('td')
            let data3 = document.createElement('td')

            data1.textContent = countries[i].country
            data2.textContent = countries[i].cases
            
            const impactLevel = calculateImpact(countries[i]).split(" ")[0]

            data3.textContent = impactLevel
            data3.classList.add("table-impact")

            if (impactLevel === "High") {
                data3.classList.add("table-impact-high")
            } else if (impactLevel === "Medium") {
                data3.classList.add("table-impact-medium")
            } else {
                data3.classList.add("table-impact-low")
            }

            row.appendChild(data1)
            row.appendChild(data2)
            row.appendChild(data3)

            tableBody.appendChild(row)
        }
    }