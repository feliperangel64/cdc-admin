import PubSub from 'pubsub-js';

export default class TratadorErros {

    publicaErros(objResponse) {
        console.log(objResponse);
        for (var i = 0; i < objResponse.errors.length; i++) {
            var erro = objResponse.errors[i];
            PubSub.publish('erro-validacao', erro)
        }
    }
}