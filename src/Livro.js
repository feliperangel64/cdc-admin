import React, { Component } from 'react';
import InputCustomizado from './components/InputCustomizado';
import SubmitCustomizado from './components/SubmitCustomizado';
import PubSub from 'pubsub-js';
import TratadorErros from './TratadorErros';
import $ from 'jquery';

class FormularioLivro extends Component {

    constructor() {
        super();
        this.state = { titulo: '', preco: '', autorId: '' }
        this.setTitulo = this.setTitulo.bind(this);
        this.setPreco = this.setPreco.bind(this);
        this.setAutorId = this.setAutorId.bind(this);
        this.enviaFormLivro = this.enviaFormLivro.bind(this);
    }

    setTitulo(evento) {
        this.setState({ titulo: evento.target.value })
    }

    setPreco(evento) {
        this.setState({ preco: evento.target.value });
    }

    setAutorId(evento) {
        this.setState({ autorId: evento.target.value });
    }

    enviaFormLivro(evento) {
        evento.preventDefault();

        $.ajax({
            url: 'https://cdc-react.herokuapp.com/api/livros',
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify({ titulo: this.state.titulo, preco: this.state.preco, autorId: this.state.autorId }),
            success: function (novaListaLivros) {
                PubSub.publish('atualiza-lista-livros', novaListaLivros);
                this.setState({ titulo: '', preco: '', autorId: '' });
            }.bind(this),
            error: function (objResponse) {
                if (objResponse.status === 400) {
                    new TratadorErros().publicaErros(objResponse.responseJSON);
                }
            },
            beforeSend: function () {
                PubSub.publish('limpa-erros', {});
            }
        });
    }

    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaFormLivro} method="post">
                    <InputCustomizado id="titulo" type="text" name="titulo" value={this.state.titulo} onChange={this.setTitulo} label="Titulo" />
                    <InputCustomizado id="preco" type="text" name="preco" value={this.state.preco} onChange={this.setPreco} label="Preço" />
                    <div className="pure-control-group">
                        <label htmlFor="autorId">Autor</label>
                        <select name="autorId" value={this.state.autorId} onChange={this.setAutorId}>
                            <option value="">Selecione</option>
                            {
                                this.props.listaAutores.map((autor) => {
                                    return (
                                        <option key={autor.id} value={autor.id}>{autor.nome}</option>
                                    );
                                })
                            }
                        </select>
                    </div>
                    <SubmitCustomizado label="Salvar" />
                </form>
            </div>
        );
    }
}

class TabelaLivro extends Component {

    render() {
        return (
            <div>
                <table className="pure-table">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Preço</th>
                            <th>Autor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.listaLivros.map((livro) => {
                                return (
                                    <tr key={livro.titulo}>
                                        <td>{livro.titulo}</td>
                                        <td>{livro.preco}</td>
                                        <td>{livro.autor.nome}</td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

export default class LivroBox extends Component {

    constructor() {
        super();
        this.state = { listaAutores: [], listaLivros: [] };
    }

    componentDidMount() {

        $.ajax({
            url: 'https://cdc-react.herokuapp.com/api/autores',
            dataType: 'json',
            success: function (resposta) {
                this.setState({ listaAutores: resposta });
            }.bind(this)
        });

        $.ajax({
            url: ' https://cdc-react.herokuapp.com/api/livros',
            dataType: 'json',
            success: function (objListaLivros) {
                this.setState({ listaLivros: objListaLivros });
            }.bind(this)
        });

        PubSub.subscribe('atualiza-lista-livros', function (topicName, listaLivrosAtual) {
            this.setState({ listaLivros: listaLivrosAtual });
        }.bind(this));
    }

    render() {
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de livros</h1>
                </div>
                <div className="content" id="content">
                    <FormularioLivro listaAutores={this.state.listaAutores} />
                    <TabelaLivro listaLivros={this.state.listaLivros} />
                </div>
            </div>
        );
    }
}