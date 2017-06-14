var Household = function (cod_card,area,area_name,address,language,comments,last_update,full_address,id,available,taken,last_id,macroarea,cod){
    this.cod_card = cod_card;
    this.area = area;
    this.area_name = area_name;
    this.address = address;
    this.language = language;
    this.comments = comments;
    this.last_update = last_update;
    this.full_address = full_address;
    this.id = id;
    this.available = available;
    this.taken = taken;
    this.last_id = last_id;
    this.macroarea = macroarea;
};

module.exports = Household;