const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

const connection = {
    host: 'ucka.veleri.hr',
    user: 'mpintar',
    password: '11',
    database: 'mpintar'
};

const conn = mysql.createConnection(connection);

conn.connect(err => {
    if (err) {
        console.error('Greška kod povezivanja s bazom:', err);
        return;
    }
    console.log('Povezano na bazu koncerti!');
});

app.get('/', (req, res) => {
    res.send('Backend radi!');
});

app.get('/koncerti', (req, res) => {
    conn.query('SELECT * FROM koncerti', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

app.get('/koncerti/:id', (req, res) => {
    const { id } = req.params;
    conn.query('SELECT * FROM koncerti WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0) return res.status(404).json({ error: 'Koncert nije pronađen' });
        res.json(results[0]);
    });
});

app.post('/koncerti', (req, res) => {
    const { naziv, cijena, broj_karata, datum, vrijeme, mjesto } = req.body;

        if (!naziv || cijena <= 0 || broj_karata <= 0 || !datum || !vrijeme || !mjesto) {
        return res.status(400).json({ error: 'Nisu popunjena sva obavezna polja!' });
        }
    conn.query(
        'INSERT INTO koncerti (naziv, cijena, broj_karata, datum, vrijeme, mjesto) VALUES (?, ?, ?, ?, ?, ?)',
        [naziv, cijena, broj_karata, datum, vrijeme, mjesto],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ id: result.insertId });
        }
    );
});

app.put('/koncerti/:id', (req, res) => {
    const { id } = req.params;
    const { naziv, cijena, broj_karata, datum, vrijeme, mjesto } = req.body;

    conn.query(
        'UPDATE koncerti SET naziv=?, cijena=?, broj_karata=?, datum=?, vrijeme=?, mjesto=? WHERE id=?',
        [naziv, cijena, broj_karata, datum, vrijeme, mjesto, id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'Koncert ažuriran' });
        }
    );
});

app.delete('/koncerti/:id', (req, res) => {
    const { id } = req.params;
    conn.query('DELETE FROM koncerti WHERE id=?', [id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: 'Koncert izbrisan' });
    });
});

app.listen(3000, () => {
    console.log('Server radi na portu 3000');
});