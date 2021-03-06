<template>
  <div id="FrontPage">
    
    <div class="card">
        <div v-show="show" class="covid">
          <h2>CoronaVirus(Covid-19) </h2>
          <p>Help protect yourself and others.</p>
          <p>No masks. No ride.</p>
          <button v-on:click="show = false">I am aware.</button>
        </div>

        <h1> Welcome to Karlpol</h1>

        <h2> Please login: </h2>
        <form @submit.prevent="login">
            <label for="Username"> Username:  </label>
            <input type="text" name="username" v-model="username" placeholder="Enter here">
            <label for="Username"> Password:  </label>
            <input type="text" name="password" v-model="password" placeholder="Enter here">
            <p v-if="feedback" class="fb">{{ feedback }}</p>
            <button class="button">Start Your Carpool Experience</button>
        </form>

        <a href="/#/signup">Don't have an account?</a>
    </div>
    

  </div>
</template>

<script>

export default {
  name: 'FrontPage',

  data(){
    return {
      username: null,
      password: null,
      feedback: null,
      show: true,
    }
  },

  methods: {
    login(){
        //authenticate
        const auth = true;
        if (auth){
          this.$router.push("./homepage")
        }else{
          this.feedback = "Incorrect username or password."
        }

    },

  }

}
</script>

<style>

</style>