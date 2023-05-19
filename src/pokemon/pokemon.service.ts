import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

@Injectable()
export class PokemonService { 
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel:Model<Pokemon>
    ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const pokemon = await this.pokemonModel.create( createPokemonDto)
      return pokemon;
    } catch (error) {
      this.handelExceptions(error)
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(busqueda: string) {
    let pokemon : Pokemon;

    if(!isNaN(+busqueda)){
      pokemon = await this.pokemonModel.findOne({nro:busqueda});
    }

    if(!pokemon && isValidObjectId(busqueda)){
      pokemon = await this.pokemonModel.findById(busqueda);
    }

    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name:busqueda.toLowerCase().trim()}) 
    }

    if(!pokemon){
      throw new NotFoundException(`El pokemon ${busqueda} no existe en la base de datos`);
    }

    return pokemon;
  }

  async update(actualizacion: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(actualizacion)
    if (updatePokemonDto.name){
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }
    try {
      await pokemon.updateOne(updatePokemonDto);
      return {...pokemon.toJSON(), ...updatePokemonDto};
    } catch (error) {
      this.handelExceptions(error)
    }
  }
  async remove(id: string) {
    const pokemon = await this.findOne(id);
    if(!isValidObjectId(id)){
      throw new NotFoundException(`El pokemon ${id} no existe en la base de datos`);
    }
    try {
      await pokemon.deleteOne();
      return 'El pokemon fue eliminado exitosamente';
    } catch (error) {
      this.handelExceptions(error)
    }
  }

  //maneja los errores del catch
  private handelExceptions(error:any) {
    if (error.code === 11000) {
      throw new BadRequestException('El pokemon ya existe en la base de datos con el nro o nombre');
    }
    console.error(error)
    throw new InternalServerErrorException('Comuniquese con el administrador')
  }
}
