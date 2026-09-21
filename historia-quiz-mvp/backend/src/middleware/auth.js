const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token não informado." });
  }
  try {
    req.user = jwt.verify(header.substring(7), process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ erro: "Token inválido ou expirado." });
  }
}

function role(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.tipo_usuario)) {
      return res.status(403).json({ erro: "Acesso não autorizado." });
    }
    next();
  };
}

module.exports = { auth, role };
