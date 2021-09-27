

//
// Connect to supabase
//
const { createClient } = supabase
supabase = createClient("https://wcvpljchludefejgonxl.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjUwNDczMywiZXhwIjoxOTQ4MDgwNzMzfQ.zxlv9PCuBKuGPhSbL159lDC9EWRY4iWvDSLgldvvjeE")

//
// Get channels
//
async function fetchChannels() {
  const { data, error } = await supabase
    .from('channels')
    .select()
    .order('created_at', { ascending: false })
    .limit(300)
  return data;
}

async function populateSidebar() {
  let channels = await fetchChannels();
  // slack convo list
  // var channels = ["tuesday-sales", "specific-issue", "how-about-another", "tiny-team", "quick-fix", "TCKT-38312", 'department-notes', 'sara-is-leaving', 'is-orange-good', 'my-keyboard', 'howto-type', 'howto-click', 'free-food-friday', 'release-chat','sys-do-not-contact','q3-reporting','systems-chat','whats-for-lunch','football-this-weekend']
  var str = '<ul class="pure-menu-list">'

  channels.forEach(function (channel) {
    var rand = Math.floor(Math.random() * 100);
    var hasNotification = Math.random() < 0.5;
    if (hasNotification) {
      str += `<li class="pure-menu-item">
            <a href="#" title="${channel.name}" class="pure-menu-link text-bold">
                #&thinsp;${channel.name}
                <span class="notification-count">${rand}</span>
            </a>                    
        </li>`;
    } else {
      str += `<li class="pure-menu-item">
            <a href="#" title="${channel.name}" style="opacity: 0.8;" class="pure-menu-link">
                #&thinsp;${channel.name}                      
            </a>                    
        </li>`;
    }

  });

  str += '</ul>';
  document.getElementById("channelsContainer").innerHTML = str;

}

populateSidebar();

//
// Get channel count
//
async function fetchChannelsCount() {
  const { data, count } = await supabase
    .from('channels')
    .select('*', { count: 'exact' })
  return count;
}

async function populateTotalChannels() {
  let total = await fetchChannelsCount();
  document.getElementById("totalChannelCount").innerHTML = total;
}

populateTotalChannels();

//
// Human Validation 
//
let human = false;
async function botCheck() {
  // bot check
  const botdPromise = Botd.load({ token: 'RWABKoAEDbhjxAIiR6s', mode: 'allData' })
  const botd = await botdPromise
  const result = await botd.detect()
  if (result.bot.automationTool.probability < 0.2 && result.bot.browserSpoofing.probability < 0.2 && result.vm.probability < 0.2) {
    human = true
  }
}

botCheck();


//
// Form Submission 
// 
var form = document.getElementById('myForm');
var formMessage = document.getElementById('formMessage');
async function onSubmit(event) {
  if (event) {
    event.preventDefault();
    
    // honeypot
    if (event.target.username.value || event.target.email.value) {      
      formMessage.innerHTML = '<span style="color: red;">You might be a bot.</span>'
      return false
    }

    if (human) {
      // submission
      let channelName = await channelNameValidation(event.target.channelName.value)
      if (!channelName) {
        return false
      } else {

        // add new channel
        channelList = document.getElementsByClassName("pure-menu-list")[0]
        var rand = Math.floor(Math.random() * 100);
        let str = `<li class="pure-menu-item">
           <a href="#" class="pure-menu-link text-bold">
               #&thinsp;${channelName}
               <span class="notification-count">${rand}</span>
           </a>                    
       </li>`;
        channelList.insertAdjacentHTML('afterbegin', str);

        // increase counter by 1
        docCount = document.getElementById('totalChannelCount');
        let count = parseInt(docCount.innerHTML)
        count++
        docCount.innerHTML = count;

        // update backend
        const { data, error } = await supabase
          .from('channels')
          .insert([
            { name: channelName }
          ])

          form.reset();
          formMessage.innerHTML = 'Wow, great... you\'ve added another channel.';
      }
    } else {
      alert('We have detected that your connection is suspicious')
    }
  }

}
form.onsubmit = onSubmit;

// Form validation
async function channelNameValidation(name) {

  // message
  var formMessage = document.getElementById('formMessage');

  let final = name.toLowerCase().trim();

  // check length
  if (final.length > 30) {
    formMessage.innerHTML = '<span style="color: red;">Channel name is too long.</span>'
    return false
  } else if (final.length < 8) {
    formMessage.innerHTML = '<span style="color: red;">Channel name is too short.</span>'
    return false
  }

  // check for special characters
  var regex = /^[a-z- \xC0-\xFF]+$/i;
  if (!regex.test(final)) {
    formMessage.innerHTML = '<span style="color: red;">Channel name may only include regular characters, spaces, and hyphens.</span>';
    return false;
  }

  // check for profanity
  if (await isProfane(final)) {
    formMessage.innerHTML = '<span style="color: red;">Please use less colorful language.</span>'
    return false
  }

  // replace spaces
  final = final.replace(/ /g, "-")

  return final
}

async function isProfane(channelName) {
  const response = await fetch('./js/lang.json');
  let badJson = await response.json();
  let badWordList = badJson.words;

  var i;
  // Chinese part
  var length = badWordList.length;
  for (i = (length - 1); i >= 0; i--) {
    if (channelName.indexOf(badWordList[i]) > -1) {
      return true;
    }
  }
  // English part
  channelName = channelName.toLowerCase();

  var words = channelName.split(" ");
  for (i = 0; i < words.length; i++) {
    var word = words[i].toLowerCase();
    if (badWordList.indexOf(word) > -1) {
      return true;
    }
  }
  return false;
}


