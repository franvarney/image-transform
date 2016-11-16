const Image = require('./src/image');

function done(err) {
  if (err) throw err;
  console.log('Completed!');
}

const example = new Image({ dir: 'images', fileName: 'test.jpg' });

example.get((err, image) => {
  if (err) throw err;
  image
    .rotate(90, { clockwise: true })
    .save('rotate-90-cw.jpg', done);
});
