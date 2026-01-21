    const listaKoncerata = document.getElementById('lista-koncerata');
    const formaDodaj = document.getElementById('forma-dodaj-koncert');
    const notifikacija = document.getElementById('notifikacija');
    const backendUrl = 'http://localhost:3000/koncerti';
    let koncertZaUrediti = null;

    function prikaziNotifikaciju(poruka, tip = 'uspjeh') {
        notifikacija.textContent = poruka;
        notifikacija.className = tip === 'uspjeh' ? 'vidljivo uspjeh' : 'vidljivo greska';
        setTimeout(() => { notifikacija.className = 'skriveno'; }, 3000);
    }

    function prikaziKoncerte() {
        listaKoncerata.innerHTML = '';
        fetch(backendUrl)
            .then(res => res.json())
            .then(data => {
                if (data.length === 0) {
                    listaKoncerata.innerHTML = '<p>Nema koncerata u bazi.</p>';
                }
                data.forEach(k => {
                    const div = document.createElement('div');
                    div.classList.add('koncert');
                    const datum = new Date(k.datum);
                    const datumFormat = datum.toLocaleDateString('hr-HR');
                    const vrijemeFormat = k.vrijeme.slice(0,5);
                    div.innerHTML = `
                        <h3>${k.naziv}</h3>
                        <p>Cijena: ${k.cijena} €</p>
                        <p>Broj karata: ${k.broj_karata}</p>
                        <p>Datum: ${datumFormat}</p>
                        <p>Vrijeme: ${vrijemeFormat}</p>
                        <p>Mjesto: ${k.mjesto}</p>
                        <button onclick="obrisiKoncert(${k.id})">Obriši</button>
                        <button onclick="urediKoncert(${k.id})">Uredi</button>
                    `;
                    listaKoncerata.appendChild(div);
                });
            })
            .catch(err => {
                console.error(err);
                listaKoncerata.innerHTML = '<p>Greška pri dohvaćanju koncerata.</p>';
            });
    }

    formaDodaj.addEventListener('submit', (e) => {
        e.preventDefault();

        const cijenaValue = parseFloat(document.getElementById('cijena').value);
        const brojKarataValue = parseInt(document.getElementById('broj_karata').value);
        const nazivValue = document.getElementById('naziv').value.trim();
        const datumValue = document.getElementById('datum').value;
        const vrijemeValue = document.getElementById('vrijeme').value;
        const mjestoValue = document.getElementById('mjesto').value.trim();

        if (!nazivValue || !datumValue || !vrijemeValue || !mjestoValue || cijenaValue <= 0 || brojKarataValue <= 0) {
        prikaziNotifikaciju('Molimo ispunite sva polja ispravno!', 'greska');
        return;
        }

        const koncert = {
            naziv: document.getElementById('naziv').value,
            cijena: cijenaValue,
            broj_karata: brojKarataValue,
            datum: document.getElementById('datum').value,
            vrijeme: document.getElementById('vrijeme').value,
            mjesto: document.getElementById('mjesto').value
        };

        if (koncertZaUrediti) {
            fetch(`${backendUrl}/${koncertZaUrediti}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(koncert)
            })
            .then(res => res.json())
            .then(() => {
                prikaziKoncerte();
                formaDodaj.reset();
                koncertZaUrediti = null;
                prikaziNotifikaciju('Koncert je uspješno ažuriran!');
            })
            .catch(() => prikaziNotifikaciju('Greška prilikom ažuriranja!', 'greska'));
        } else {
            fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(koncert)
            })
            .then(res => res.json())
            .then(() => {
                prikaziKoncerte();
                formaDodaj.reset();
                prikaziNotifikaciju('Koncert je uspješno dodan!');
            })
            .catch(() => prikaziNotifikaciju('Greška prilikom dodavanja!', 'greska'));
        }
    });

    window.obrisiKoncert = function(id) {
        if (!confirm('Jeste li sigurni da želite obrisati ovaj koncert?')) return;
        fetch(`${backendUrl}/${id}`, { method: 'DELETE' })
            .then(() => {
                prikaziKoncerte();
                prikaziNotifikaciju('Koncert je uspješno obrisan!');
            })
            .catch(() => prikaziNotifikaciju('Greška prilikom brisanja!', 'greska'));
    }

    window.urediKoncert = function(id) {
        fetch(backendUrl)
            .then(res => res.json())
            .then(data => {
                const k = data.find(item => item.id === id);
                if (k) {
                    document.getElementById('naziv').value = k.naziv;
                    document.getElementById('cijena').value = k.cijena;
                    document.getElementById('broj_karata').value = k.broj_karata;
                    document.getElementById('datum').value = k.datum;
                    document.getElementById('vrijeme').value = k.vrijeme;
                    document.getElementById('mjesto').value = k.mjesto;
                    koncertZaUrediti = id;
                }
            });
    }

    prikaziKoncerte();