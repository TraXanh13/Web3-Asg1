const express = require('express');
const supa = require('@supabase/supabase-js');
const app = express();
const config = require("./config.json")
const supabase = supa.createClient(config.url, config.key);

/*
 * Returns all seasons
 */
app.get('/api/seasons', async (req, res) => {
    try{ 
        const {data, error} = await supabase
            .from('seasons')
            .select();

        if(error)
            return res.json({error: `${error.message}`});

        res.send(data);

    } catch {
        res.json({error: "Server Error"});
    }
});

/*
 * Returns all circuits
 */
app.get('/api/circuits', async (req, res) => {
    try{
        const {data, error} = await supabase
            .from('circuits')
            .select();
        
        if(error)
            return res.json({error: `${error.message}`});

        res.send(data);
    } catch {
        res.json({error: "Server Error"});
    }
});

/*
 * Returns the specific circuit
 * 
 * @ref: the circuit name
 */
app.get('/api/circuits/:ref', async (req, res) => {
    try{
        const {data, error} = await supabase
            .from('circuits')
            .select()
            .eq("circuitRef", req.params.ref);

        if(error)
            return res.json({error: `${error.message}`});

        if(!data || data.length === 0){
            return res.json({error: `${req.params.ref} does not exist`})
        }
        res.send(data);
    } catch {
        res.json({error: "Server Error"});
    }
});

/*
 * Returns the circuits used in a given season
 * 
 * @year: the circuit name
 */
app.get('/api/circuits/season/:year', async (req, res) => {
    try{
        // From races, collect all of the circuits used for that year
        const {data, error} = await supabase
            .from('races')
            .select(`circuits(*)`)
            .eq("year", req.params.year);
        
        if(error)
            return res.json({error: `${error.message}`});

        if(!data || data.length === 0){
            return res.json({error: `${req.params.year} does not exist`})
        }

        res.send(data);
    } catch {
        res.json({error: "Server Error"});
    }
});

/*
 * Returns all constructors
 */
app.get('/api/constructors', async (req, res) => {
    try{
        const {data, error} = await supabase
            .from('constructors')
            .select()

        if(error)
            return res.json({error: `${error.message}`});

        res.send(data);
    } catch {
        res.json({error: "Server Error"});
    }
});

/*
 * Returns the specific constructor(s)
 * 
 * @ref: the constructor reference
 */
app.get('/api/constructors/:ref', async (req, res) => {
    try{
        const {data, error} = await supabase
            .from('constructors')
            .select()
            .eq("constructorRef", req.params.ref)

        if(error)
            return res.json({error: `${error.message}`});
        
        if(!data || data.length === 0){
            return res.json({error: `${req.params.ref} does not exist`})
        }

        res.send(data);
    } catch {
        res.json({error: "Server Error"});
    }
});

/*
 * Returns all drivers
 */
app.get('/api/drivers', async (req, res) => {
    try{    
        const {data, error} = await supabase
            .from('drivers')
            .select()

        if(error)
            return res.json({error: `${error.message}`});

        res.send(data);
    } catch {
        res.json({error: "Server Error"});
    }
});

/*
 * Returns the specific driver
 * 
 * @surname: the drivers surname
 */
app.get('/api/drivers/:surname', async (req, res) => {
    try{
        const {data, error} = await supabase
            .from('drivers')
            .select()
            .eq("driverRef", req.params.surname);
        
        if(error)
            return res.json({error: `${error.message}`});
        
        if(!data || data.length === 0){
            return res.json({error: `${req.params.surname} does not exist`})
        }

        res.send(data);
    } catch {
        res.json({error: "Server Error"});
    };
});

/*
 * Returns the specific driver(s) searched
 * 
 * @surname: the drivers surname being searched
 */
app.get('/api/drivers/search/:surname', async (req, res) => {
    try{
        const {data, error} = await supabase
            .from('drivers')
            .select()
            .ilike("surname", `${req.params.surname}%`);

        if(error)
            return res.json({error: `${error.message}`});
        
        if(!data || data.length === 0){
            return res.json({error: `${req.params.surname} does not exist`})
        }

        res.send(data);
    } catch {
        res.json({error: "Server Error"});
    }
});

/*
 * Returns the drivers in a specific race
 *
 * @raceId: the spefic race that is being checked
 */
app.get('/api/drivers/race/:raceId', async (req, res) => {
    try{
        const {data, error} = await supabase
            .from('results')
            .select(`
                drivers!inner(*)
            `)
            .eq("raceId", req.params.raceId);
    
        if(error)
            return res.json({error: `${error.message}`});
        
        if(!data || data.length === 0){
            return res.json({error: `${req.params.raceId} does not exist`})
        }

        res.send(data);
    } catch {
        res.json({error: "Server Error"});
    }
});

/*
 * Returns the specific race
 * 
 * @raceId: the spefic race id
 */
app.get('/api/races/:raceId', async (req, res) => {
    try{
        const {data, error} = await supabase
            .from('races')

            /*
            * Selects all of the items from the 'races' except for the circuitId.
            * circuitId was replaced with items from the 'circuits' table
            */
            .select(`
                raceId, year, round, name, date, time, url, fp1_date, fp1_time, fp2_date, fp2_time, 
                fp3_date, fp3_time, quali_date, quali_time, sprint_date, sprint_time,
                circuits(name, location, country)
            `)
            .eq("raceId", req.params.raceId);

        if(error)
            return res.json({error: `${error.message}`});
        
        if(!data || data.length === 0){
            return res.json({error: `${req.params.raceId} does not exist`})
        }

        res.send(data);
    } catch {
        res.json({error: "Server Error"});
    }
});

/*
 * Returns the race in the specified year/season
 * 
 * @year: the spefic year/season
 */
app.get('/api/races/season/:year', async (req, res) => {
    try{
        const {data, error} = await supabase
            .from('races')
            .select()
            .eq("year", req.params.year)
            .order("round", {ascending: true});
        
        if(error)
            return res.json({error: `${error.message}`});
        
        if(!data || data.length === 0){
            return res.json({error: `${req.params.year} does not exist`})
        }

        res.send(data);
    } catch {
        res.json({error: "Server Error"});
    }
});

/*
 * Returns the race in the specified year/season and round
 * 
 * @year: the spefic year/season
 * @round: the round of the race
 */
app.get('/api/races/season/:year/:round', async (req, res) => {
    try{
        const {data, error} = await supabase
            .from('races')
            .select()
            .eq("year", req.params.year)
            .eq("round", req.params.round)
            .order("round", {ascending: true});
        
        if(error)
            return res.json({error: `${error.message}`});
        
        if(!data || data.length === 0){
            return res.json({error: `${req.params.year} and ${req.params.round} does not exist`})
        }

        res.send(data);
    } catch {
        res.json({error: "Server Error"});
    }
});

/*
 * Returns all races on a given circuit ordered by year
 * 
 * @ref: the circuit reference
 */
app.get('/api/races/circuits/:ref', async (req, res) => {
    try{
        const {data, error} = await supabase
            .from('races')
            // Inner joining the circuits table to the races table
            .select(`
                raceId, year, round, name, date, time, url, 
                fp1_date, fp1_time, fp2_date, fp2_time, fp3_date, fp3_time, 
                quali_date, quali_time, sprint_date, sprint_time,
                circuits!inner (circuitRef,name)
            `)
            // Comparing the reference to the circuit table
            .eq("circuits.circuitRef", req.params.ref)
            .order("year", {ascending: false});
    
        if(error)
            return res.json({error: `${error.message}`});
        
        if(!data || data.length === 0)
            return res.json({error: `${req.params.ref} does not exist`})

        res.send(data);
    } catch {
        res.json({error: "Server Error"});
    }
});

/*
 * Returns all races on a given circuit between two years
 * 
 * @ref: the circuit reference
 * @start: starting year
 * @end: ending year
 */
app.get('/api/races/circuits/:ref/season/:start/:end', async (req, res) => {
    try{
        const {data, error} = await supabase
            .from('races')
            // Inner joining the circuits table to the races table
            .select(`
                raceId, year, round, name, date, time, url, 
                fp1_date, fp1_time, fp2_date, fp2_time, fp3_date, fp3_time, 
                quali_date, quali_time, sprint_date, sprint_time,
                circuits!inner (circuitRef,name)
            `)
            // Comparing the reference to the circuit table
            .eq("circuits.circuitRef", req.params.ref)
            // Greater than or equal to the start year
            .gte("year", req.params.start)
            // Less than or equal to the end year
            .lte("year", req.params.end)
            .order("year", {ascending: false});

        if(error)
            return res.json({error: `${error.message}`});

        if(!data || data.length === 0)
            return res.json({error: `${req.params.ref} does not exist`})

        res.send(data);
    } catch {
        res.json({error: "Server Error"});
    }   
});

/*
 * Returns the results for a specific race
 * 
 * @raceId: the race id
 */
app.get('/api/results/:raceId', async (req, res) => {
    try{
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
        
        if(error)
            return res.json({error: `${error.message}`});
        
        if(!data || data.length === 0)
            return res.json({error: `${req.params.raceId} does not exist`})

        res.send(data);
    } catch {
        res.json({error: "Server Error"});
    }
});

/*
 * Returns all of the results of a given driver
 * 
 * @ref: the drivers name
 */
app.get('/api/results/driver/:ref', async (req, res) => {
    try{
        const {data, error} = await supabase
            .from('results')
            // Joining the drivers table to results to get the name
            .select(`
                *, drivers!inner()'
            `)
            .eq("drivers.driverRef", req.params.ref);
        
        if(error)
            return res.json({error: `${error.message}`});
        
        if(!data || data.length === 0)
            return res.json({error: `${req.params.ref} does not exist`})

        res.send(data);
    } catch {
        res.json({error: "Server Error"});
    }
});

/*
 * Returns all of the results of a given driver between two years
 * 
 * @ref: the drivers name
 * @start: the starting season year
 * @end: the ending season year
 */
app.get('/api/results/driver/:ref/seasons/:start/:end', async (req, res) => {
    try{
        const {data, error} = await supabase
        .from('results')
        .select(`
        *, drivers!inner(), races!inner(year)
        `)
        .eq("drivers.driverRef", req.params.ref)
        .gte("races.year", req.params.start)
        .lte("races.year", req.params.end);
        
        if(error)
            return res.json({error: `${error.message}`});
        
        if(!data || data.length === 0)
            return res.json({error: `${req.params.ref}, ${req.params.start}, ${req.params.end} does not exist`})

        res.send(data);
    } catch {
        res.json({error: "Server Error"});
    }
});

/*
 * Returns the qualifying results for the specified race
 * 
 * @raceId: the specific race
 */
app.get('/api/qualifying/:raceId', async (req, res) => {
    try{
        const {data, error} = await supabase
        .from('qualifying')
        // Replacing the foreign keys with the specific drivers, races, and constructors info
        .select(`
            qualifyId, number, position, q1, q2, q3, 
            drivers (driverRef, code, forename, surname),
            races (name, round, year, date), 
            constructors (name, constructorRef, nationality)
        `)
        .eq("raceId", req.params.raceId)
        .order("position", { ascending: true});

        if(error)
            return res.json({error: `${error.message}`});
        
        if(!data || data.length === 0)
            return res.json({error: `${req.params.raceId} does not exist`})

        res.send(data);
    } catch {
        res.json({error: "Server Error"});
    }
});

/*
 * Returns the current season driver standings table for the specified race
 * 
 * @raceId: the specific race
 */
app.get('/api/standings/:raceId/drivers', async (req, res) => {
    try{
        const {data, error} = await supabase
        .from('driverStandings')
        // Replacing the foreign keys with the specific drivers, and races info
        .select(`
            driverStandingsId, points, position, positionText, wins,
            drivers (driverRef, code, forename, surname),
            races (name, round, year, date)
        `)
        .eq("raceId", req.params.raceId)
        .order("position", { ascending: true});

        if(error)
            return res.json({error: `${error.message}`});
        
        if(!data || data.length === 0)
            return res.json({error: `${req.params.raceId} does not exist`})

        res.send(data);
    } catch {
        res.json({error: "Server Error"});
    }
});

/*
 * Returns the current season constructors standings table for the specified race
 * 
 * @raceId: the specific race
 */
app.get('/api/standings/:raceId/constructors', async (req, res) => {
    try{
        const {data, error} = await supabase
        .from('constructorStandings')
        // Replacing the foreign keys with the specific drivers, and races info
        .select(`
            constructorStandingsId, points, position, positionText, wins,
            constructors (name, constructorRef, nationality),
            races (name, round, year, date)
        `)
        .eq("raceId", req.params.raceId)
        .order("position", { ascending: true});

        if(error)
            return res.json({error: `${error.message}`});
        
        if(!data || data.length === 0)
            return res.json({error: `${req.params.raceId} does not exist`})

        res.send(data);
    } catch {
        res.json({error: "Server Error"});
    }
});

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
    console.log('http://localhost:8080/api/results/driver/max_verstappen');
    console.log('http://localhost:8080/api/results/drivers/sainz/seasons/2022/2022');
    console.log('http://localhost:8080/api/qualifying/1106');
    console.log('http://localhost:8080/api/standings/1106/drivers');
    console.log('http://localhost:8080/api/standings/1106/constructors');
    console.log("\nTest Calls")
    console.log("http://localhost:8080/api/seasons");
    console.log("http://localhost:8080/api/circuits");
    console.log("http://localhost:8080/api/circuits/monza");
    console.log("http://localhost:8080/api/circuits/calgary");
    console.log("http://localhost:8080/api/constructors");
    console.log("http://localhost:8080/api/constructors/ferrari");
    console.log("http://localhost:8080/api/drivers");
    console.log("http://localhost:8080/api/drivers/Norris");
    console.log("http://localhost:8080/api/drivers/norris");
    console.log("http://localhost:8080/api/drivers/connolly");
    console.log("http://localhost:8080/api/drivers/search/sch");
    console.log("http://localhost:8080/api/drivers/search/xxxxx");
    console.log("http://localhost:8080/api/drivers/race/1069");
    console.log("http://localhost:8080/api/races/1034");
    console.log("http://localhost:8080/api/races/season/2021");
    console.log("http://localhost:8080/api/races/season/2022/4");
    console.log("http://localhost:8080/api/races/circuits/monza");
    console.log("http://localhost:8080/api/races/circuits/monza/season/2015/2022");
    console.log("http://localhost:8080/api/results/1106");
    console.log("http://localhost:8080/api/results/driver/max_verstappen");
    console.log("http://localhost:8080/api/results/driver/connolly");
    console.log("http://localhost:8080/api/results/driver/sainz/seasons/2021/2022");
    console.log("http://localhost:8080/api/qualifying/1106");
    console.log("http://localhost:8080/api/standings/1120/drivers");
    console.log("http://localhost:8080/api/standings/1120/constructors");
    console.log("http://localhost:8080/api/standings/asds/constructors");
});