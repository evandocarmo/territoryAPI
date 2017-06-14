var CodCard = function (count,cod_card,area,area_name,last_update,id,available,taken,last_id,macroarea){
    this.count = count;
    this.cod_card = cod_card;
    this.area = area;
    this.area_name = area_name;
    this.last_update = last_update;
    this.id = id;
    this.available = available;
    this.taken = taken;
    this.last_id = last_id;
    this.macroarea = macroarea;
};
module.exports = CodCard;