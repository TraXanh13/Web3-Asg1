const express = require('express');
const supa = require('@supabase/supabase-js');
const app = express();
const config = require("./config.json")
const supabase = supa.createClient(config.url, config.key);

app.get('/f1/status', async (req, res) => {
    const {data, error} = await supabase
        .from('status')
        .select();
    res.send(data);
});

app.get('/f1/seasons', async (req, res) => {
    const {data, error} = await supabase
        .from('seasons')
        .select();
    res.send(data);
});

app.get('/f1/races', async (req, res) => {
    const {data, error} = await supabase
        .from('races')
        .select(`
            raceId, year, round, circuitId, name, circuits (name,location,country)
        `)
        .eq('year',2020)
        .order('round', { ascending: false });
    res.send(data);
});

app.get('/f1/results/:race', async (req, res) => {
    const {data, error} = await supabase
        .from('results')
        .select(`
            resultId, positionOrder, races (year, name),
            drivers (forename,surname), constructors (name)
        `)
        .eq('raceId',req.params.race)
        .order('positionOrder', { ascending: true });
    res.send(data);
});

app.get('/f1/qualifying/:race1', async (req, res) => {
    const {data, err} = await supabase
        .from('qualifying')
        .select(`
            qualifyId, position, q1, q2, q3, races(name, year), drivers(surname, forename), constructors(name)
        `)
        .eq('raceId', req.params.race1)
        .order('position', {ascending: true});

    res.send(data);
});

app.get('/f1/races/:year1/:year2', async (req, res) => {
    const {data, error} = await supabase
        .from('races')
        .select()
        .gte("year", req.params.year1)
        .lte("year", req.params.year2)
        .order('year', { ascending: true });
    res.send(data);
});

app.get('/f1/races/:year1/:year2', async (req, res) => {
    const {data, error} = await supabase
        .from('races')
        .select()
        .gte("year", req.params.year1)
        .lte("year", req.params.year2)
        .order('year', { ascending: true });
    res.send(data);
});

app.get('/f1/drivers/name/:name/limit/:limit', async (req, res) => {
    const {data, error} = await supabase
        .from('drivers')
        .select()
        .ilike("surname", `${req.params.name}%`)
        .limit(req.params.limit)
        .order("surname", {ascending: true});

    res.send(data);
});



app.listen(8080, () => {
    console.log('listening on port 8080');
    // console.log('http://localhost:8080/f1/status');
    // console.log('http://localhost:8080/f1/seasons');
    // console.log('http://localhost:8080/f1/races');
    console.log('http://localhost:8080/f1/qualifying/1034');
    console.log('http://localhost:8080/f1/races/2020/2022');
    console.log('http://localhost:8080/f1/drivers/name/sch/limit/12');
});