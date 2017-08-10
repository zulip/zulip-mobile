import getMessageContent from '../getMessageContent';
/* eslint-disable */
describe('getAutocompleteFilter', () => {
  test('if there is no <pre> tag do nothing', () => {
    expect(
      getMessageContent(
        '<p><span class="user-mention" data-user-email="brock@zulipchat.com" data-user-id="136">@Brock Whittaker</span> I think the plan is to work that out once we have the markdown syntax down.</p>',
      ),
    ).toEqual(
      '<p><span class="user-mention" data-user-email="brock@zulipchat.com" data-user-id="136">@Brock Whittaker</span> I think the plan is to work that out once we have the markdown syntax down.</p>',
    );
  });

  test('replace break lines with <br> only inside <pre> tag', () => {
    expect(
      getMessageContent(
        `<div class="codehilite"><pre><span></span>sudo wget -qO - http://akashnimare.in/repos/zulip/deb.key <span class="p">|</span> sudo apt-key add -
sudo sh -c <span class="s1">&#39;echo &quot;deb [arch=amd64] http://akashnimare.in/repos/zulip stable main&quot; &gt; /etc/apt/sources.list.d/zulip.list&#39;</span>
sudo apt-get update
sudo apt-get install zulip
</pre></div>`,
      ),
    ).toEqual(
      `<div class="codehilite"><pre><span></span>sudo wget -qO - http://akashnimare.in/repos/zulip/deb.key <span class="p">|</span> sudo apt-key add -<br />sudo sh -c <span class="s1">&#39;echo &quot;deb [arch=amd64] http://akashnimare.in/repos/zulip stable main&quot; &gt; /etc/apt/sources.list.d/zulip.list&#39;</span><br />sudo apt-get update<br />sudo apt-get install zulip<br /></pre></div>`,
    );
  });

  test('do nothing if no line break is present inside pre tag', () => {
    expect(getMessageContent(`<div><pre>this is inside</pre><div>`)).toEqual(
      `<div><pre>this is inside</pre><div>`,
    );
  });

  test('handle multiple <pre> tags', () => {
    expect(
      getMessageContent(`<div><pre>this is
inside</pre>Some text<pre>this is
inside</pre><div>`),
    ).toEqual(`<div><pre>this is<br />inside</pre>Some text<pre>this is<br />inside</pre><div>`);
  });

  test('do not replace line breaks which are outside <pre> tag', () => {
    expect(
      getMessageContent(`<div><p>this is
        inside</p>Some text<pre>this is
inside</pre><div>`),
    ).toEqual(
      `<div><p>this is
        inside</p>Some text<pre>this is<br />inside</pre><div>`,
    );
  });

  test('replace only line breaks, keep spaces if they are present', () => {
    expect(
      getMessageContent(`<div><p>this is inside</p>Some text<pre>this is
              inside</pre><div>`),
    ).toEqual(
      `<div><p>this is inside</p>Some text<pre>this is<br />              inside</pre><div>`,
    );
  });
});
