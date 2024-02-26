const express = require('express');
const supa = require('@supabase/supabase-js');
const app = express();
const config = require("./config.json")
const supabase = supa.createClient(config.url, config.key);

/*
 * Returns all seasons
 */
app.get('/api/seasons', async (req, res) => {
    const {data, error} = await supabase
        .from('seasons')
        .select();

    if(error || data.length === 0){
        res.send(`Error fetching data.. Please try again`);
        return
    }

    res.send(data);
});

/*
 * Returns all circuits
 */
app.get('/api/circuits', async (req, res) => {
    const {data, error} = await supabase
        .from('circuits')
        .select();
    
    if(error || data.length === 0){
        res.send(`Error fetching data.. Please try again`);
        return
    }

    res.send(data);
});

/*
 * Returns the specific circuit
 * 
 * @ref: the circuit name
 */
app.get('/api/circuits/:ref', async (req, res) => {
    const {data, error} = await supabase
        .from('circuits')
        .select()
        .eq("circuitRef", req.params.ref);
    res.send(data);
});

/*
 * Returns the circuits used in a given season
 * 
 * @year: the circuit name
 */
app.get('/api/circuits/season/:year', async (req, res) => {
    // From races, collect all of the circuits used for that year
    const {data, error} = await supabase
        .from('races')
        .select(`
            circuits(*)
        `)
        .eq("year", req.params.year);

    res.send(data);
});

/*
 * Returns all constructors
 */
app.get('/api/constructors', async (req, res) => {
    const {data, error} = await supabase
        .from('constructors')
        .select()

    res.send(data);
});

/*
 * Returns the specific constructor(s)
 * 
 * @ref: the constructor reference
 */
app.get('/api/constructors/:ref', async (req, res) => {
    const {data, error} = await supabase
        .from('constructors')
        .select()
        .eq("constructorRef", req.params.ref)

    res.send(data);
});

/*
 * Returns all drivers
 */
app.get('/api/drivers', async (req, res) => {
    const {data, error} = await supabase
        .from('drivers')
        .select()

    res.send(data);
});

/*
 * Returns the specific driver
 * 
 * @surname: the drivers surname
 */
app.get('/api/drivers/:surname', async (req, res) => {
    const {data, error} = await supabase
        .from('drivers')
        .select()
        .eq("driverRef", req.params.surname);

    res.send(data);
});

/*
 * Returns the specific driver(s) searched
 * 
 * @surname: the drivers surname being searched
 */
app.get('/api/drivers/search/:surname', async (req, res) => {
    const {data, error} = await supabase
        .from('drivers')
        .select()
        .ilike("driverRef", `${req.params.surname}%`);

    res.send(data);
});

/*
 * Returns the drivers in a specific race
 * TODO: Complete this
 * @raceId: the spefic race that is being checked
 */
app.get('/api/drivers/race/:raceId', async (req, res) => {
    const {data, error} = await supabase
        .from('races')
        .select()
        .eq("raceId", req.params.raceId);
        
    res.send(data);
});

/*
 * Returns the specific race
 * 
 * @raceId: the spefic race id
 */
app.get('/api/races/:raceId', async (req, res) => {
    const {data, error} = await supabase
        .from('races')

        /*
         * Selects all of the items from the 'races' except for the circuitId.
         * circuitId was replaced with items from the 'circuits' table
         */
        .select(`
            raceId, round, name, date, time, url, fp1_date, fp1_time, fp2_date, fp2_time, 
            fp3_date, fp3_time, quali_date, quali_time, sprint_date, sprint_time,
            circuits(name, location, country)
        `)
        .eq("raceId", req.params.raceId);
        
    res.send(data);
});

/*
 * Returns the race in the specified year/season
 * 
 * @year: the spefic year/season
 */
app.get('/api/races/season/:year', async (req, res) => {
    const {data, error} = await supabase
        .from('races')
        .select()
        .eq("year", req.params.year)
        .order("round", {ascending: true});
        
    res.send(data);
});

/*
 * Returns the race in the specified year/season and round
 * 
 * @year: the spefic year/season
 * @round: the round of the race
 */
app.get('/api/races/season/:year/:round', async (req, res) => {
    const {data, error} = await supabase
        .from('races')
        .select()
        .eq("year", req.params.year)
        .eq("round", req.params.round)
        .order("round", {ascending: true});
        
    res.send(data);
});

/*
 * Returns all races on a given circuit ordered by year
 * 
 * @ref: the circuit reference
 */
app.get('/api/races/circuits/:ref', async (req, res) => {
    const {data, error} = await supabase
        .from('races')
        // Inner joining the circuits table to the races table
        .select(`
            raceId, year, circuits!inner (circuitRef,name)
        `)
        // Comparing the reference to the circuit table
        .eq("circuits.circuitRef", req.params.ref)
        .order("year", {ascending: false});
        
    res.send(data);
});

/*
 * Returns all races on a given circuit between two years
 * 
 * @ref: the circuit reference
 * @start: starting year
 * @end: ending year
 */
app.get('/api/races/circuits/:ref/season/:start/:end', async (req, res) => {
    const {data, error} = await supabase
        .from('races')
        // Inner joining the circuits table to the races table
        .select(`
            raceId, year, circuits!inner (circuitRef,name)
        `)
        // Comparing the reference to the circuit table
        .eq("circuits.circuitRef", req.params.ref)
        .gte("year", req.params.start)
        .lte("year", req.params.end)
        .order("year", {ascending: false});
        
    res.send(data);
});

/*
 * Returns the results for a specific race
 * 
 * @raceId: the race id
 */
app.get('/api/results/:raceId', async (req, res) => {
    const {data, error} = await supabase
        .from('results')
        .select(`
            resultId, number, grid, position, positionText, positionOrder, points, 
            laps, time, milliseconds, fastestLap, rank, fastestLapTime, fastestLapSpeed, statusId,
            drivers (driverRef, code, forename, surname),
            races (name, round, year, date), 
            constructors (name, constructorRef, nationality)
        `)
        .eq("raceId", req.params.raceId)
        .order("grid", {ascending: true});
        
    res.send(data);
});

//TODO: /api/results/driver/ref



// app.get('/f1/races', async (req, res) => {
//     const {data, error} = await supabase
//         .from('races')
//         .select(`
//             raceId, year, round, circuitId, name, circuits (name,location,country)
//         `)
//         .eq('year',2020)
//         .order('round', { ascending: false });
//     res.send(data);
// });

// app.get('/f1/results/:race', async (req, res) => {
//     const {data, error} = await supabase
//         .from('results')
//         .select(`
//             resultId, positionOrder, races (year, name),
//             drivers (forename,surname), constructors (name)
//         `)
//         .eq('raceId',req.params.race)
//         .order('positionOrder', { ascending: true });
//     res.send(data);
// });

// app.get('/f1/qualifying/:race1', async (req, res) => {
//     const {data, err} = await supabase
//         .from('qualifying')
//         .select(`
//             qualifyId, position, q1, q2, q3, races(name, year), drivers(surname, forename), constructors(name)
//         `)
//         .eq('raceId', req.params.race1)
//         .order('position', {ascending: true});

//     res.send(data);
// });

// app.get('/f1/races/:year1/:year2', async (req, res) => {
//     const {data, error} = await supabase
//         .from('races')
//         .select()
//         .gte("year", req.params.year1)
//         .lte("year", req.params.year2)
//         .order('year', { ascending: true });
//     res.send(data);
// });

// app.get('/f1/races/:year1/:year2', async (req, res) => {
//     const {data, error} = await supabase
//         .from('races')
//         .select()
//         .gte("year", req.params.year1)
//         .lte("year", req.params.year2)
//         .order('year', { ascending: true });
//     res.send(data);
// });

// app.get('/f1/drivers/name/:name/limit/:limit', async (req, res) => {
//     const {data, error} = await supabase
//         .from('drivers')
//         .select()
//         .ilike("surname", `${req.params.name}%`)
//         .limit(req.params.limit)
//         .order("surname", {ascending: true});

//     res.send(data);
// });

app.listen(8080, () => {
    console.log('listening on port 8080');
    console.log('http://localhost:8080/api/seasons');
    console.log('http://localhost:8080/api/circuits');
    console.log('http://localhost:8080/api/circuits/monaco');
    console.log('http://localhost:8080/api/circuits/season/2020');
    console.log('http://localhost:8080/api/constructors');
    console.log('http://localhost:8080/api/constructors/mclaren');
    console.log('http://localhost:8080/api/drivers/');
    console.log('http://localhost:8080/api/drivers/hamilton');
    console.log('http://localhost:8080/api/drivers/search/sch');
    console.log('http://localhost:8080/api/drivers/race/1106');
    console.log('http://localhost:8080/api/races/19');
    console.log('http://localhost:8080/api/races/season/2020');
    console.log('http://localhost:8080/api/races/season/2022/4');
    console.log('http://localhost:8080/api/races/circuits/monza');
    console.log('http://localhost:8080/api/races/circuits/monza/season/2015/2020');
    console.log('http://localhost:8080/api/races/circuits/monza/season/2020/2020');
    console.log('http://localhost:8080/api/results/1106');
    console.log('http://localhost:8080');
    console.log('http://localhost:8080');
});