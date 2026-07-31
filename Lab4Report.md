# Lab 4: USCities Search Microservices
# Report

| | |
|---|---|
| **Course** | EECE/CS 3093C — Software Engineering, Summer 2026 |
| **Instructor** | Dr. Phu Phung |
| **Name** | Morgan Schirmer |
| **Email** | schirmmr@mail.uc.edu |
| **Back-End Repository** | [https://github.com/schirmmr/microservices-schirmmr](https://github.com/schirmmr/microservices-schirmmr) |
| **Front-End Repository** | [https://github.com/schirmmr/uscities-search](https://github.com/schirmmr/uscities-search) |
| **Azure Microservice URL** | [https://schirmmr-uscities-microservices-a4h9fufeg7djbhfm.canadacentral-01.azurewebsites.net](https://schirmmr-uscities-microservices-a4h9fufeg7djbhfm.canadacentral-01.azurewebsites.net) |
| **GitHub Pages URL** | [https://schirmmr.github.io/uscities-search/](https://schirmmr.github.io/uscities-search/) |

---

## Overview

Lab 4 develops a small cloud-based application using a microservices architecture. The project is split into two independently deployed codebases:

1. A **USCities back-end microservice** developed with Node.js and Express. It connects to MongoDB Atlas, searches the `uscities` collection by ZIP code or city name, and returns matching records as a JSON array. The service is packaged with Docker and deployed to Microsoft Azure App Services.
2. A **static front-end application** developed with HTML, CSS, and JavaScript. It calls the published microservice with `fetch()`, validates the returned JSON, converts the records into a readable HTML table or list, and provides live search suggestions. The front end is deployed to GitHub Pages through GitHub Actions.

The final application allows a visitor to search for US cities using either a complete or partial ZIP code or a complete or partial city name. Search results are displayed without refreshing the page.

### High-Level Architecture

```text
Visitor
   |
   v
GitHub Pages Front End
HTML / CSS / JavaScript
   |
   | HTTPS fetch request
   v
Azure App Service
Node.js / Express USCities Microservice
   |
   | MongoDB query
   v
MongoDB Atlas
uscities-microservices.uscities
```

The front end and back end are separate codebases and can be updated and deployed independently.

---

# Front-End Working Example

<img width="1816" height="853" alt="image" src="https://github.com/user-attachments/assets/696e769c-8025-46e4-9320-f119d39c9e1e" />

---

# Lab 4 Assignment Tasks

## Task 0 — Microservice Preparation

Task 0 established the back-end environment required for the remaining Lab 4 work.

The completed preparation included:

- Creating a separate `uscities-microservices` repository.
- Configuring a Node.js and Express microservice.
- Connecting the server to MongoDB Atlas.
- Creating a `Dockerfile` and `.dockerignore`.
- Building and testing the Docker image locally.
- Pushing the image to Docker Hub.
- Deploying the container to Azure App Services.
- Importing the provided US cities dataset into MongoDB Atlas.

### Database Configuration

| Item | Configuration |
|---|---|
| MongoDB database | `uscities-microservices` |
| MongoDB collection | `uscities` |

---

## Task 1 — Database Microservices with MongoDB and Express.js

Task 1 implemented two RESTful routes that query MongoDB and return selected city fields as JSON.

### Common Result Fields

The microservice projects only the fields required by the front end:

```javascript
const fields = {
  _id: 0,
  city: 1,
  state_id: 1,
  state_name: 1,
  county_name: 1,
  timezone: 1,
  zips: 1
};
```

### Task 1a — Search by ZIP Code

The ZIP-code route accepts 1 to 5 numeric characters. A regular expression is created from the submitted ZIP text so that partial ZIP searches are supported.

```javascript
app.get(/^\/uscities-search\/(\d{1,5})$/, async (req, res) => {
  const zipCode = req.params[0];
  console.log(`Debug> /uscities-search -> zipCode= ${zipCode}`);
  try {
    const zipRegEx = new RegExp(zipCode);
    const results = await uscities.find({ zips: zipRegEx}).project(fields).toArray();
    res.json(results);
  } catch (error) {
    console.log('ZIP search error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
```

### Task 1b — Search by City Name

The city-name route accepts a complete or partial city name.

```javascript
app.get('/uscities-search/:city', async (req, res) => {
  console.log(`Debug> /uscities-search -> city= ${req.params.city}`);
  try {
    const cityRegEx = new RegExp(req.params.city, 'i');
    const results = await uscities.find({ city: cityRegEx}).project(fields).toArray();
    res.json(results);
  } catch (error) {
    console.error('City search error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
```

### Task 1 CI/CD

After the routes were implemented, the Docker image was rebuilt with the same Docker Hub tag and pushed to Docker Hub. Azure App Services was configured for continuous deployment from that image.

---

## Task 2 — Front-End Development for the City Search Microservice

Task 2 created the public front-end application and deployed it to GitHub Pages. 

A public `uscities-search` repository was created for the static front end. GitHub Pages was configured to use the **GitHub Actions** source, and the generated Static HTML workflow was committed to the repository.

---

## Use-Case: Search US Cities

## Use Case Brief Description
User enters a ZIP code or city name, presses Enter, or clicks Search, and the system displays
the matching cities from USCities Microservice APIs with the base URL of [https://schirmmr-uscities-microservices-a4h9fufeg7djbhfm.canadacentral-01.azurewebsites.net](https://schirmmr-uscities-microservices-a4h9fufeg7djbhfm.canadacentral-01.azurewebsites.net/), and two routes: 

| Method | Route | Description |
|---|---|---|
| GET | `/uscities-search/:zip` | Returns a JSON array of cities matching the subset of the given ZIP code |
| GET | `/uscities-search/:city` | Returns a JSON array of cities matching the subset of the given city name (case-insensitive) |

JSON array response example  (Empty if no matching):

```json
[
  {
    "city": "Dayton",
    "state_id": "OH",
    "state_name": "Ohio",
    "county_name": "Montgomery",
    "timezone": "America/New_York",
    "zips": "45401 45402 45403"
  }
]
```

## User Stories
1. As a site visitor, I want to search for cities by ZIP code or name, so that I can
   quickly find location details. **[AC1-4]**
2. As a site visitor, I want to see live search suggestions as I type, so that I don't
   have to finish typing a complete ZIP code or city name before seeing results. **[AC5-8]**
3. As a site visitor, I want the search feature to resist common injection and error-handling weaknesses, so that I am protected. **[AC9-11]**

## Acceptance Criteria

- [ ] AC1: Given a valid ZIP code, when the visitor searches, then matching cities are displayed.
- [ ] AC2: Given a valid city name, when the visitor searches, then matching cities are displayed  (case-insensitive).
- [ ] AC3: Given a query with no matches, then a "No cities found" message is displayed.
- [ ] AC4: Given a network/server error, then an error message is shown, and the page does not crash.
- [ ] AC5: Given at least 2 characters typed, when a key is pressed, then cities whose ZIP or     
name CONTAINS the typed text are shown — a partial/subset match, not a complete or exact ZIP/city.
- [ ] AC6: Given the visitor keeps typing, the suggestion list reflects only the current input - no stale results from an earlier keystroke.
- [ ] AC7: Given rapid keystrokes, requests are debounced (~300ms after the last keystroke), not fired on every keystroke.
- [ ] AC8: Given no partial matches, "No cities found" is shown instead of an empty/stale list.
- [ ] AC9: Given the query field, when a search is triggered (click or keypress), then the input is trimmed and validated before any network call — empty or whitespace-only queries never generate a remote request _(Input validation, client-side — defense in depth for OWASP A05:2025 Injection)_
- [ ] AC10: Microservice API response fields must be validated before displaying as literal text _(Output sanitization — OWASP A05:2025 Injection, covers XSS)_
- [ ] AC11: Given any unexpected condition such as malformed JSON, a timeout, a status code not explicitly handled — when it occurs, then the page fails safely (shows an error) rather than failing open (showing stale/wrong data silently) or crashing _(Robust programming, mishandling of exceptional conditions — OWASP A10:2025)_

## Sequence Diagram

[![](https://img.plantuml.biz/plantuml/svg/VLHDJzj04BtxLunog8YKA0aKIdD081egsW9L0nmgBXjdOg-otdLtrmJtKFNQU_z2_nY_f6_NIVXeg2MlRE_Cl3VlZVVGUM5zLQX4fDvOQesbPxgMJkAjHSBHbMERb0YIgIo5zjGwiKRxxaXFu_x9wEdkrVXOUicEpcHg3P9lPSekXfwDaqGeJwExKY7UasDXqvosZeu7tTTjkl_vcqRQioKm6JTxayfxenF25PXGzm28msNOrzFFFTIfErHQTkuXEKNz-R94mienVPAtJAxACdPU6kq2w6vtlm4rckPSnnh_85tM9PEWD1SM4k7xLcnNg4Vezx_-RCS8ruxv9wDLzZkUc4gdJ3zs-lqYehvfOhI1q5PckISpYx6dcJOMMBecgRip5VV0gGHT9fyBJzBTQ6r86Ps1oGoT-fn92O-kGWlEMpFdWBBNJbXFa-I1ogML1RsYMw7a50d0A2iVGj-seojuY69mKVgwjyWn2AuKANUDLZLzgzZMw-PGCcWqf7C3XjXpmKpj6wqZH0STwcuizYpv08CmfFUZI-fLBet3qcqceJVyBaiA1cxO2bA_eDnO511e0Iwc0ciAKySqCJudZq1evK9hDxhIGgSvL9w2TiPt99HbCQqn6MLfh7UqChSGFitP9H6naMT0FQpRSTsDwruKR1aAEoeeJilhR1nb2lIs-tsw-DYX3-EBSnBMYZeGRzfRnpyOTRroQEtzJBAQEfhmB0o8XR5X3i6ettwIlxRbInE20fL2KrkpIYbI4Yv1M_NiLsXgHEUEZdTYO_knCKpQIeR_TDLO7DlQJAQ58McQRIHg0I9yMzPkFOP_7U47WmQVuQcTTyZBWk5i9x0lX88AHNImaMSJkLsGwwtoy3GHqoZ_1hbFX5Jan8p3n4AWadNKTl22jYDh0msS5IBZbKuuHXNt5ZWPCu9tWbnk5isn5Nx3S1zYmK7x5m00)](https://editor.plantuml.com/uml/VLHDJzj04BtxLunog8YKA0aKIdD081egsW9L0nmgBXjdOg-otdLtrmJtKFNQU_z2_nY_f6_NIVXeg2MlRE_Cl3VlZVVGUM5zLQX4fDvOQesbPxgMJkAjHSBHbMERb0YIgIo5zjGwiKRxxaXFu_x9wEdkrVXOUicEpcHg3P9lPSekXfwDaqGeJwExKY7UasDXqvosZeu7tTTjkl_vcqRQioKm6JTxayfxenF25PXGzm28msNOrzFFFTIfErHQTkuXEKNz-R94mienVPAtJAxACdPU6kq2w6vtlm4rckPSnnh_85tM9PEWD1SM4k7xLcnNg4Vezx_-RCS8ruxv9wDLzZkUc4gdJ3zs-lqYehvfOhI1q5PckISpYx6dcJOMMBecgRip5VV0gGHT9fyBJzBTQ6r86Ps1oGoT-fn92O-kGWlEMpFdWBBNJbXFa-I1ogML1RsYMw7a50d0A2iVGj-seojuY69mKVgwjyWn2AuKANUDLZLzgzZMw-PGCcWqf7C3XjXpmKpj6wqZH0STwcuizYpv08CmfFUZI-fLBet3qcqceJVyBaiA1cxO2bA_eDnO511e0Iwc0ciAKySqCJudZq1evK9hDxhIGgSvL9w2TiPt99HbCQqn6MLfh7UqChSGFitP9H6naMT0FQpRSTsDwruKR1aAEoeeJilhR1nb2lIs-tsw-DYX3-EBSnBMYZeGRzfRnpyOTRroQEtzJBAQEfhmB0o8XR5X3i6ettwIlxRbInE20fL2KrkpIYbI4Yv1M_NiLsXgHEUEZdTYO_knCKpQIeR_TDLO7DlQJAQ58McQRIHg0I9yMzPkFOP_7U47WmQVuQcTTyZBWk5i9x0lX88AHNImaMSJkLsGwwtoy3GHqoZ_1hbFX5Jan8p3n4AWadNKTl22jYDh0msS5IBZbKuuHXNt5ZWPCu9tWbnk5isn5Nx3S1zYmK7x5m00)

```
@startuml
actor "Site Visitor" as User
participant "Front-End" as FE
participant "USCities Microservices" as MS

alt Explicit search (AC1-4) — Enter or Search button
    User -> FE: Enter ZIP/city, press Enter or click Search
else Live suggestions (AC5-8) — on keypress
    User -> FE: Type a character (partial ZIP/city, ≥2 chars)
    FE -> FE: Debounce ~300ms (AC7)
    note right of FE: Ignore any in-flight response that is\nno longer for the latest keystroke (AC6)
end

FE -> FE: Trim & validate input (AC9)
alt AC9 — empty/whitespace-only query
    FE --> User: No request sent
else valid, non-empty query
    FE -> MS: GET /uscities-search/:zip  or  /uscities-search/:city
    note right of FE: Same two routes serve both triggers —\nunanchored regex already supports partial matches

    alt AC1 / AC2 / AC5 / AC6 — matches found
        MS --> FE: 200 OK, JSON array of cities
        FE -> FE: Validate response fields before render (AC10)
        FE --> User: Render results (full list or live suggestions)
    else AC3 / AC8 — no matches
        MS --> FE: 200 OK, empty array
        FE --> User: "No cities found" / "No matches"
    else AC4 / AC11 — network, timeout, or malformed response
        MS --> FE: 500 / timeout / bad JSON
        FE -> FE: Fail safe, not open (AC11)
        FE --> User: Error message — no stale/wrong data shown
    end
end
@enduml
```

#### GitHub Issue / PBI

<img width="1439" height="129" alt="image" src="https://github.com/user-attachments/assets/498def33-1ce8-48a3-a9d3-c6c025663ad9" />

---

### Task 2 - Handling JSON Data  

Raw JSON is useful during development, but it is not an appropriate final display for a visitor. The client converts the JSON array into a readable table.

Every value is converted to a string and sanitized.

### Task 2 - Instant Requests  

The search input also provides live suggestions. Suggestions begin only after at least two characters have been entered. A debounce timer waits approximately 300ms after the most recent keystroke before sending the request.

```javascript
var debounceTimer = null;
searchInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        clearTimeout(debounceTimer);
        search();
        searchInput.value = ''; //clear the field after an Enter search
        return;
    }
    clearTimeout(debounceTimer);
    var query = searchInput.value.trim();
    if (query.length < 2) return; // AC5: need at least 2 characters before suggesting
    debounceTimer = setTimeout(search, 300); //AC7: debounce ~300ms after the last keystroke
});
```

This design reduces unnecessary requests and prevents older responses from replacing newer results.

---

# System Analysis

## Functional Requirements

- **FR-1:** A visitor can search using a complete or partial city name.
- **FR-2:** A visitor can search using a complete or partial ZIP code.
- **FR-3:** The front end calls the published microservice asynchronously without reloading the page.
- **FR-4:** Matching records are displayed in a readable table.
- **FR-5:** The interface displays a clear 'no-results' message for an empty result array.
- **FR-6:** Live suggestions begin after at least two characters.
- **FR-7:** Live suggestion requests are debounced.

---

# Security — SSDLC

Security was considered during the analysis, design, implementation, and deployment stages.

## Security Requirements

- **SR-1:** The client must trim and URL-encode user input before constructing an API request.
- **SR-2:** Empty or whitespace-only input must not generate a request.
- **SR-3:** The client must verify the HTTP status before processing the response.
- **SR-4:** The client must verify that the parsed response is an array before displaying it.
- **SR-5:** All city fields must be sanitized before insertion into the DOM.
- **SR-6:** Rapid live-search requests must be debounced.
- **SR-7:** Responses from earlier requests must not overwrite results associated with newer input.

---

# Getting Started Locally

### Back-End Microservice

```bash
npm start
```

### Front-End Application

```bash
python -m http.server 8080
```

---

## CI/CD Pipeline

### Azure Back-End Deployment

1. Commit the microservice changes.
2. Build the Docker image with the Azure-linked Docker Hub tag.
3. Push the image to Docker Hub.
4. Azure App Services retrieves the updated image.

### GitHub Pages Front-End Deployment

1. Commit changes to the `main` branch of `uscities-search`.
2. Push the commit to GitHub.
3. The Static HTML GitHub Actions workflow starts automatically.
4. The workflow uploads and deploys the static artifact.
5. Verify the final application at the GitHub Pages URL.

---

# User Guide and Demo

## Search by City Name

1. Open the GitHub Pages application.
2. Enter a complete city name or at least two characters of a city name.
3. Pause to view live suggestions, or select **Search** / press Enter.
4. Review the matching cities, state, and ZIP information.

---

## Search by ZIP Code

1. Enter a complete ZIP code or a ZIP substring.
2. Pause to view live matches, or select **Search** / press Enter.
3. Review the cities and state associated with the matching ZIP text.

---


# License and Code of Conduct

This project was developed for academic purposes as part of EECE/CS 3093C at the University of Cincinnati. The project follows the ACM/IEEE Software Engineering Code of Ethics:

https://www.acm.org/code-of-ethics

If the repository is published for use outside the course, an explicit software license should be added to the repository.

---

*This lab report was prepared as part of EECE/CS 3093C Software Engineering, Summer 2026, University of Cincinnati.*
