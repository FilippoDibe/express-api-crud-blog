const path = require("path");
const fs = require("fs");
const { generateSlug, updatePosts, posts } = require('../utilities.js');
const multer = require("multer");

const index = (req, res) => {
    res.format({
        html: () => {
            let html = `<div style="display: flex; justify-content: center; flex-direction: column; align-items: center;">`;
            posts.forEach(({ title, content, image, tags }) => {
                html += `
                    <div>
                        <h2>${title}</h2>
                        <img src="imgs/posts/${image}" heigth="100px" width="250px"/>
                        <h6 style=" width:500px;">${content}</h6>
                `;
                // Verifica se tags è un array prima di eseguire forEach
                if (Array.isArray(tags)) {
                    tags.forEach(tag => html += `<ul><li>${tag}</li></ul>`);
                }
                html += `
                    </div>
                `;
            });
            html += '</div>';
            res.send(html);
        },
        json: () => {
            res.json(posts);
        }
    });
}



const show = (req, res) => {
    const slugPostRichiesta = req.params.slug;
    const postRichiesta = posts.find(post => post.slug === slugPostRichiesta);

    res.format({
        json: () => {
            if (postRichiesta) {
                const image_url = `http://${req.headers.host}/imgs/posts/${postRichiesta.image}`;
                const image_download_url = `http://${req.headers.host}/posts/${slugPostRichiesta}/download`;

                const postWithUrls = {
                    ...postRichiesta,
                    image_url: image_url,
                    image_download_url: image_download_url
                };
                
                res.json(postWithUrls);
            } else {
                res.status(404).json({ error: "Post not found" });
            }
        }
    });
};


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/imgs/posts'); // Directory di destinazione per l'upload delle immagini
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Nome del file
    }
});

const upload = multer({ storage: storage }).single('image'); // 'image' è il nome del campo del file nel modulo HTML

const create = (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Errore durante il caricamento dell\'immagine');
        }
        
        // Dati del post
        const { title, content, tags } = req.body;
        const image = req.file.filename; // Nome del file dell'immagine caricata

        // Assicurati che tags sia un array
        const postTags = Array.isArray(tags) ? tags : [tags];

        // Logica per creare il nuovo post
        // Genera lo slug unico per il post
        const slug = generateSlug(title, posts.map(post => post.slug));

        // Aggiungi il nuovo post all'array dei post
        posts.push({ title, content, image, tags: postTags, slug });

        // Salva l'array dei post nel file JSON
        updatePosts(posts);

        // Invia una risposta appropriata
        res.format({
            html: () => {
                res.redirect('/posts');
            },
            default: () => {
                res.json({ message: 'Nuovo post creato con successo!' });
            }
        });
    });
};


const downloadImage = (req, res) => {
    const slug = req.params.slug;
    const encodedSlug = encodeURIComponent(slug);
    const imagePath = path.join(__dirname, `../public/imgs/posts/${encodedSlug}.jpeg`);
    if (fs.existsSync(imagePath)) {
        res.download(imagePath);
    } else {
        res.status(404).send('Image not found.');
    }
};

// Middleware per verificare se esiste un post corrispondente al slug
const checkPostExists = (req, res, next) => {
    const slug = req.params.slug;
    const postExists = posts.some(post => post.slug === slug);
    if (!postExists) {
        return res.status(404).send('Post not found');
    }
    next(); // Passa al prossimo middleware se il post esiste
};

const destroy = (req, res) => {
    const slug = req.params.slug;
    const deletedPostIndex = posts.findIndex(post => post.slug === slug);
    if (deletedPostIndex === -1) {
        return res.status(404).send('Post not found');
    }
    const deletedPost = posts.splice(deletedPostIndex, 1)[0]; // Rimuove il post dall'array

    // Aggiorna il file db.js con i post aggiornati
    updatePosts(posts);

    res.format({
        html: () => {
            res.redirect('/posts');
        },
        default: () => {
            res.send('Post eliminato');
        }
    });
};


module.exports = {
    index,
    show,
    create,
    downloadImage,
    destroy: [checkPostExists, destroy]
};
