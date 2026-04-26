# gates-foundation-product
SP26 DSS x Datagood x OP Case Competition Product Track - [Ayah Elzein, Maxime Chung, Jenny Liang]

### Basic Git Commands & Set up ###
**Set Up**
- Recommended approach: Create a new folder on your local desktop for case competition
- Clone the remote git repository:
  - Run `git remote https://github.com/Jennyl51/gates-foundation-product`
- Change directory to gates-foundation-product `cd gates-foundation-product`
  - `gates-foundation-product` is just a container folder, and the real frontend and backend is in the directory named `oecd-dashboard`
- Check remote connect `git remote -v`
- Pull all changes `git pull`

**Run Dashboard**
- Change directory: `cd oecd-dashboard`
```bash
npm install
npm run dev
```

- Open site: http://localhost:3000/

**Push Changes**
```bash
git add .
git commite -m"your message"
git push origin main
```

**Change Branch/merge**
- To check all the branches: `git branch`
- To move to a certain branch: `git checkout branch-name`
- To merge branch:
  - move to main branch: `git checkout main`
  - merge branch: `git merge branch-name`
