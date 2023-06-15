const TechSchema = require("../Database/Models/Technology");

const ofertProduct = async (req, res) => {
  try {
    const { id, numOferta } = req.body;
    await TechSchema.findOneAndUpdate(
      { _id: id },
      { Ofertas: numOferta },
      { new: true }
    );

    res.status(200).json({ message: "New Offert modify successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error offert product" });
    console.error(error);
  }
};

const getOfertProducts = async (req, res) => {
  try {
    const ofertProducts = await TechSchema.find({ Ofertas: { $exists: true } });
    res.status(200).json({ result: ofertProducts });
  } catch (error) {
    res.status(400).json({ message: "Error al obtener las ofertas" });
    console.error(error);
  }
};

module.exports = { ofertProduct, getOfertProducts };