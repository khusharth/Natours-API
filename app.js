const fs = require('fs');
const express = require('express');

const app = express();

// need to use this middleware to add the data from the body to the req object
app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello from the server side!' });
});

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

app.get('/api/v1/tours/:id', (req, res) => {
  // req.params.id is a string and if we multiply a string that looks like a number
  // with a number then the string is converted to a number
  const id = req.params.id * 1;

  // find returns an array with el that satisfies the () condition
  const tour = tours.find((el) => el.id === id);

  // if (id > tours.length) {
  if (!tour) {
    // return used to exit the function
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

app.post('/api/v1/tours', (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      // 201 = created
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
});

// put: We expect that our app to receive an entire updated object
// patch: We only expect particular updated properties of the object
app.patch('/api/v1/tours/:id', (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...',
    },
  });
});

app.delete('/api/v1/tours/:id', (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  // 204: No content
  // null represents the resource that we deleted now no longer exists
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const port = 3000;
// starts a server
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
